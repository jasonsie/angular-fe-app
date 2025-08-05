import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../../../core/providers/image.service';
import { ImageData } from '../../../core/models/api.model';

interface ImageFile {
  file: File;
  url: string;
  id: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent implements OnInit {
  private readonly imageService = inject(ImageService);

  readonly selectedImages = signal<ImageFile[]>([]);
  readonly mockImages = signal<ImageData[]>([]);
  readonly isDragOver = signal(false);
  readonly isUploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly uploadMessage = signal('');
  readonly uploadSuccess = signal(false);

  readonly totalSize = computed(() =>
    this.selectedImages().reduce((total, image) => total + image.file.size, 0)
  );

  ngOnInit(): void {
    this.loadMockImages();
  }

  private async loadMockImages(): Promise<void> {
    try {
      // Load mock images from the service
      const mockImages = this.imageService.getMockImages();
      this.mockImages.set(mockImages);

      // Optionally, load images via API simulation
      await this.imageService.fetchAndUpdateImages();
    } catch (error) {
      console.error('Error loading mock images:', error);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  private handleFiles(files: File[]): void {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      this.showMessage(
        'Some files were skipped because they are not images.',
        false
      );
    }

    const newImages: ImageFile[] = imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: this.generateId(),
    }));

    this.selectedImages.update((current) => [...current, ...newImages]);
  }

  removeImage(id: string): void {
    this.selectedImages.update((current) => {
      const imageToRemove = current.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return current.filter((img) => img.id !== id);
    });
  }

  clearImages(): void {
    // Clean up object URLs to prevent memory leaks
    this.selectedImages().forEach((image) => {
      URL.revokeObjectURL(image.url);
    });
    this.selectedImages.set([]);
    this.uploadProgress.set(0);
    this.uploadMessage.set('');
  }

  async uploadImages(): Promise<void> {
    if (this.selectedImages().length === 0) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.uploadMessage.set('');

    try {
      // Use the mock API service to upload images
      const files = this.selectedImages().map(img => img.file);

      // Upload with progress tracking
      const response = await this.imageService.uploadImages(files).toPromise();

      if (response?.success) {
        this.showMessage(
          `Successfully uploaded ${files.length} image(s)!`,
          true
        );

        // Reload images to show the newly uploaded ones
        await this.imageService.fetchAndUpdateImages();
        this.clearImages();
      } else {
        throw new Error(response?.message || 'Upload failed');
      }
    } catch (error) {
      this.showMessage('Upload failed. Please try again.', false);
      console.error('Upload error:', error);
    } finally {
      this.isUploading.set(false);
    }
  }

  /**
   * Download an image - handles both user-uploaded files and backend images
   * @param image - Can be either ImageFile (user upload) or ImageData (backend)
   */
  downloadImage(image: ImageFile | ImageData): void {
    try {
      // Determine if this is a user-uploaded file or backend image
      const isUserUpload = 'file' in image;

      if (isUserUpload) {
        this.downloadUserUploadedImage(image as ImageFile);
      } else {
        this.downloadBackendImage(image as ImageData);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      this.showMessage('Failed to download image', false);
    }
  }

  /**
   * Download user-uploaded image (has blob URL)
   */
  private downloadUserUploadedImage(image: ImageFile): void {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.file.name;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download backend image (URL or base64)
   */
  private downloadBackendImage(image: ImageData): void {
    if (this.isBase64Image(image.url)) {
      this.downloadBase64Image(image);
    } else {
      this.downloadImageFromUrl(image);
    }
  }

  /**
   * Check if the image URL is a base64 string
   */
  private isBase64Image(url: string): boolean {
    return url.startsWith('data:image/');
  }

  /**
   * Download image from base64 string
   */
  private downloadBase64Image(image: ImageData): void {
    const link = document.createElement('a');
    link.href = image.url;

    // Generate proper filename with extension
    let filename = image.filename;
    if (!filename || !filename.includes('.')) {
      const mimeType = this.getMimeTypeFromBase64(image.url);
      const extension = this.getFileExtension(filename || `image_${image.id}`, mimeType);
      filename = `${filename || `image_${image.id}`}.${extension}`;
    }

    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download image from regular URL (fetch and create blob)
   */
  private async downloadImageFromUrl(image: ImageData): Promise<void> {
    try {
      // Show loading state
      this.showMessage('Downloading image...', true);

      const response = await fetch(image.url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Generate proper filename with extension
      let filename = image.filename;
      if (!filename || !filename.includes('.')) {
        const contentType = response.headers.get('content-type');
        const extension = this.getFileExtension(filename || `image_${image.id}`, contentType || undefined);
        filename = `${filename || `image_${image.id}`}.${extension}`;
      }

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);

      this.showMessage('Image downloaded successfully', true);
    } catch (error) {
      console.error('Error downloading image from URL:', error);
      this.showMessage('Failed to download image from server', false);
      throw error;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private showMessage(message: string, success: boolean): void {
    this.uploadMessage.set(message);
    this.uploadSuccess.set(success);

    // Clear message after 5 seconds
    setTimeout(() => {
      this.uploadMessage.set('');
    }, 5000);
  }

  /**
   * Get file extension from filename or MIME type
   */
  private getFileExtension(filename: string, mimeType?: string): string {
    // Try to get extension from filename first
    const extensionFromName = filename.split('.').pop()?.toLowerCase();
    if (extensionFromName && extensionFromName.length <= 4) {
      return extensionFromName;
    }

    // Fallback to MIME type if available
    if (mimeType) {
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'image/bmp': 'bmp',
        'image/tiff': 'tiff'
      };
      return mimeToExt[mimeType] || 'jpg';
    }

    return 'jpg'; // Default fallback
  }

  /**
   * Extract MIME type from base64 data URL
   */
  private getMimeTypeFromBase64(base64Url: string): string | undefined {
    const match = base64Url.match(/^data:([^;]+);base64,/);
    return match ? match[1] : undefined;
  }

  /**
   * Load mock images using the service
   */
  async loadMockImagesFromService(): Promise<void> {
    try {
      const response = await this.imageService.loadImages().toPromise();
      if (response?.success && response.data) {
        this.mockImages.set(response.data);
        this.showMessage(`Loaded ${response.data.length} mock images`, true);
      }
    } catch (error) {
      this.showMessage('Failed to load mock images', false);
      console.error('Error loading mock images:', error);
    }
  }

  /**
   * Search mock images
   */
  async searchMockImages(query: string): Promise<void> {
    try {
      const response = await this.imageService.searchImages(query).toPromise();
      if (response?.success && response.data) {
        this.mockImages.set(response.data);
        this.showMessage(`Found ${response.data.length} images`, true);
      }
    } catch (error) {
      this.showMessage('Search failed', false);
      console.error('Search error:', error);
    }
  }

  /**
   * Get image service signals for template access
   */
  get serviceImages() {
    return this.imageService.images;
  }

  get isServiceLoading() {
    return this.imageService.isLoading();
  }

  get isServiceUploading() {
    return this.imageService.isUploading();
  }
}
