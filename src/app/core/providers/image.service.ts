import { Injectable, inject, signal } from '@angular/core';
import { Observable, BehaviorSubject, finalize } from 'rxjs';
import { MockApiService } from './mock-api.service';
import { ImageData, ApiResponse, UploadResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly mockApiService = inject(MockApiService);

  // Loading states
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly uploadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly uploading$ = this.uploadingSubject.asObservable();

  // Data signals
  readonly images = signal<ImageData[]>([]);
  readonly uploadProgress = signal<number>(0);
  readonly lastError = signal<string | null>(null);

  /**
   * Load all images from the mock API
   */
  loadImages(): Observable<ApiResponse<ImageData[]>> {
    this.loadingSubject.next(true);
    this.lastError.set(null);

    return this.mockApiService.getImages().pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Load images and update local state
   */
  async fetchAndUpdateImages(): Promise<void> {
    try {
      const response = await this.loadImages().toPromise();
      if (response?.success && response.data) {
        this.images.set(response.data);
      }
    } catch (error) {
      this.lastError.set('Failed to load images');
      console.error('Error loading images:', error);
    }
  }

  /**
   * Get a single image by ID
   */
  getImageById(id: string): Observable<ApiResponse<ImageData | null>> {
    this.lastError.set(null);
    return this.mockApiService.getImageById(id);
  }

  /**
   * Upload multiple images
   */
  uploadImages(files: File[]): Observable<ApiResponse<UploadResponse>> {
    this.uploadingSubject.next(true);
    this.uploadProgress.set(0);
    this.lastError.set(null);

    // Simulate progress updates
    this.simulateUploadProgress();

    return this.mockApiService.uploadImages(files).pipe(
      finalize(() => {
        this.uploadingSubject.next(false);
        this.uploadProgress.set(0);
      })
    );
  }

  /**
   * Upload images with real-time progress
   */
  uploadImagesWithProgress(files: File[]): Observable<{ progress: number; message: string }> {
    this.uploadingSubject.next(true);
    this.lastError.set(null);

    return this.mockApiService.uploadWithProgress(files).pipe(
      finalize(() => this.uploadingSubject.next(false))
    );
  }

  /**
   * Delete an image
   */
  deleteImage(id: string): Observable<ApiResponse<boolean>> {
    this.lastError.set(null);
    return this.mockApiService.deleteImage(id);
  }

  /**
   * Search images
   */
  searchImages(query: string, tags?: string[]): Observable<ApiResponse<ImageData[]>> {
    this.loadingSubject.next(true);
    this.lastError.set(null);

    return this.mockApiService.searchImages(query, tags).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Get mock images (for preview/testing)
   */
  getMockImages(): ImageData[] {
    // This returns the mock images directly for immediate use
    return [
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
  }

  /**
   * Reset all data (for testing)
   */
  reset(): void {
    this.images.set([]);
    this.uploadProgress.set(0);
    this.lastError.set(null);
    this.mockApiService.resetUploadedImages();
  }

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get current uploading state
   */
  isUploading(): boolean {
    return this.uploadingSubject.value;
  }

  private simulateUploadProgress(): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      this.uploadProgress.set(Math.round(progress));
    }, 300);

    // Complete progress when upload finishes
    setTimeout(() => {
      clearInterval(interval);
      this.uploadProgress.set(100);
    }, 2000);
  }
}
