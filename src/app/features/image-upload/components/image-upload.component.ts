import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class ImageUploadComponent {
  readonly selectedImages = signal<ImageFile[]>([]);
  readonly isDragOver = signal(false);
  readonly isUploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly uploadMessage = signal('');
  readonly uploadSuccess = signal(false);

  readonly totalSize = computed(() =>
    this.selectedImages().reduce((total, image) => total + image.file.size, 0)
  );

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
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        this.uploadProgress.set(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Here you would typically upload to your backend
      // const formData = new FormData();
      // this.selectedImages().forEach(image => {
      //   formData.append('images', image.file);
      // });
      // await this.httpClient.post('/api/upload', formData).toPromise();

      this.showMessage(
        `Successfully uploaded ${this.selectedImages().length} image(s)!`,
        true
      );
      this.clearImages();
    } catch (error) {
      this.showMessage('Upload failed. Please try again.', false);
      console.error('Upload error:', error);
    } finally {
      this.isUploading.set(false);
    }
  }

  downloadImage(image: ImageFile): void {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.file.name;
    link.style.display = 'none';

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
}
