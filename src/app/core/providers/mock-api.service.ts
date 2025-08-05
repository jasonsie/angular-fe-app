import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ApiResponse, ImageData, UploadResponse, MockApiConfig } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private readonly config: MockApiConfig = {
    baseUrl: '/mock-data',
    delayMs: 1000,
    successRate: 0.9 // 90% success rate
  };

  private readonly mockImages: ImageData[] = [
    {
      id: '1',
      filename: '0101308.png',
      url: '/mock-data/images/0101308.png',
      size: 245760,
      uploadedAt: new Date('2024-01-01'),
      tags: ['sample', 'image1']
    },
    {
      id: '2',
      filename: '0101309.png',
      url: '/mock-data/images/0101309.png',
      size: 189440,
      uploadedAt: new Date('2024-01-02'),
      tags: ['sample', 'image2']
    },
    {
      id: '3',
      filename: '0101310.png',
      url: '/mock-data/images/0101310.png',
      size: 201728,
      uploadedAt: new Date('2024-01-03'),
      tags: ['sample', 'image3']
    },
    {
      id: '4',
      filename: '0101311.png',
      url: '/mock-data/images/0101311.png',
      size: 178176,
      uploadedAt: new Date('2024-01-04'),
      tags: ['sample', 'image4']
    },
    {
      id: '5',
      filename: 'sample-base64.png',
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      size: 95,
      uploadedAt: new Date('2024-01-05'),
      tags: ['sample', 'base64'],
      mimeType: 'image/png',
      isBase64: true
    }
  ];

  private readonly uploadedImages = signal<ImageData[]>([]);

  /**
   * Simulates fetching all available images from the server
   */
  getImages(): Observable<ApiResponse<ImageData[]>> {
    return of({
      data: this.mockImages,
      success: true,
      message: 'Images fetched successfully',
      timestamp: Date.now()
    }).pipe(
      delay(this.config.delayMs)
    );
  }

  /**
   * Simulates fetching a single image by ID
   */
  getImageById(id: string): Observable<ApiResponse<ImageData | null>> {
    const image = this.mockImages.find(img => img.id === id);

    return of({
      data: image || null,
      success: !!image,
      message: image ? 'Image found' : 'Image not found',
      timestamp: Date.now()
    }).pipe(
      delay(this.config.delayMs / 2)
    );
  }

  /**
   * Simulates uploading images to the server
   */
  uploadImages(files: File[]): Observable<ApiResponse<UploadResponse>> {
    // Simulate random failures based on success rate
    const shouldSucceed = Math.random() < this.config.successRate;

    if (!shouldSucceed) {
      return throwError(() => ({
        error: 'Upload failed',
        message: 'Server error occurred during upload',
        timestamp: Date.now()
      })).pipe(
        delay(this.config.delayMs)
      );
    }

    // Simulate successful upload
    const uploadedImages: ImageData[] = files.map((file, index) => ({
      id: this.generateId(),
      filename: file.name,
      url: `/api/images/${this.generateId()}`, // Simulated server URL
      size: file.size,
      uploadedAt: new Date(),
      tags: ['uploaded']
    }));

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Update local state
    this.uploadedImages.update(current => [...current, ...uploadedImages]);

    return of({
      data: {
        uploadedImages,
        totalSize
      },
      success: true,
      message: `Successfully uploaded ${files.length} image(s)`,
      timestamp: Date.now()
    }).pipe(
      delay(this.config.delayMs * 1.5) // Longer delay for uploads
    );
  }

  /**
   * Simulates deleting an image
   */
  deleteImage(id: string): Observable<ApiResponse<boolean>> {
    const imageExists = this.mockImages.some(img => img.id === id) ||
                       this.uploadedImages().some(img => img.id === id);

    if (!imageExists) {
      return throwError(() => ({
        error: 'Image not found',
        message: `Image with ID ${id} not found`,
        timestamp: Date.now()
      })).pipe(
        delay(this.config.delayMs / 2)
      );
    }

    // Remove from uploaded images if it exists there
    this.uploadedImages.update(current => current.filter(img => img.id !== id));

    return of({
      data: true,
      success: true,
      message: 'Image deleted successfully',
      timestamp: Date.now()
    }).pipe(
      delay(this.config.delayMs)
    );
  }

  /**
   * Simulates search functionality
   */
  searchImages(query: string, tags?: string[]): Observable<ApiResponse<ImageData[]>> {
    let filteredImages = [...this.mockImages, ...this.uploadedImages()];

    if (query) {
      filteredImages = filteredImages.filter(img =>
        img.filename.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (tags && tags.length > 0) {
      filteredImages = filteredImages.filter(img =>
        img.tags?.some(tag => tags.includes(tag))
      );
    }

    return of({
      data: filteredImages,
      success: true,
      message: `Found ${filteredImages.length} image(s)`,
      timestamp: Date.now()
    }).pipe(
      delay(this.config.delayMs / 2)
    );
  }

  /**
   * Simulates progress tracking for uploads
   */
  uploadWithProgress(files: File[]): Observable<{ progress: number; message: string }> {
    return new Observable(observer => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          observer.next({ progress, message: 'Upload completed!' });
          observer.complete();
          clearInterval(interval);
        } else {
          observer.next({
            progress: Math.round(progress),
            message: `Uploading... ${Math.round(progress)}%`
          });
        }
      }, 200);

      return () => clearInterval(interval);
    });
  }

  /**
   * Get configuration
   */
  getConfig(): MockApiConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MockApiConfig>): void {
    Object.assign(this.config, newConfig);
  }

  /**
   * Reset uploaded images (for testing)
   */
  resetUploadedImages(): void {
    this.uploadedImages.set([]);
  }

  /**
   * Get uploaded images signal (readonly)
   */
  getUploadedImages() {
    return this.uploadedImages.asReadonly();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
