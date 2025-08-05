import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService, MockApiService } from '../../../core/providers';
import { ImageData } from '../../../core/models';

@Component({
  selector: 'app-mock-api-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demo-container">
      <h2>Mock API Service Demo</h2>

      <div class="demo-section">
        <h3>API Configuration</h3>
        <div class="config-controls">
          <label>
            Delay (ms):
            <input type="number" [(ngModel)]="delayMs" (change)="updateConfig()" />
          </label>
          <label>
            Success Rate:
            <input type="number" min="0" max="1" step="0.1" [(ngModel)]="successRate" (change)="updateConfig()" />
          </label>
        </div>
      </div>

      <div class="demo-section">
        <h3>API Operations</h3>
        <div class="button-group">
          <button type="button" (click)="loadImages()" [disabled]="loading()">
            Load Images
          </button>
          <button type="button" (click)="searchImages()" [disabled]="loading()">
            Search "sample"
          </button>
          <button type="button" (click)="uploadMockFiles()" [disabled]="uploading()">
            Mock Upload
          </button>
          <button type="button" (click)="reset()">
            Reset
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Loading...</div>
      }

      @if (uploading()) {
        <div class="uploading">
          <p>Uploading... {{ uploadProgress() }}%</p>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
          </div>
        </div>
      }

      @if (lastMessage()) {
        <div class="message" [class.error]="isError()">
          {{ lastMessage() }}
        </div>
      }

      <div class="demo-section">
        <h3>Images ({{ images().length }})</h3>
        @if (images().length > 0) {
          <div class="image-grid">
            @for (image of images(); track image.id) {
              <div class="image-card">
                <img [src]="image.url" [alt]="image.filename" />
                <div class="image-details">
                  <h4>{{ image.filename }}</h4>
                  <p>Size: {{ formatFileSize(image.size || 0) }}</p>
                  <p>ID: {{ image.id }}</p>
                  @if (image.tags && image.tags.length > 0) {
                    <div class="tags">
                      @for (tag of image.tags; track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </div>
                  }
                  <button type="button" (click)="deleteImage(image.id)" class="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="no-images">No images loaded. Click "Load Images" to see mock data.</p>
        }
      </div>

      <div class="demo-section">
        <h3>Service State</h3>
        <div class="state-info">
          <p><strong>Service Loading:</strong> {{ imageService.isLoading() }}</p>
          <p><strong>Service Uploading:</strong> {{ imageService.isUploading() }}</p>
          <p><strong>Total Service Images:</strong> {{ imageService.images().length }}</p>
          <p><strong>Uploaded Images:</strong> {{ mockApiService.getUploadedImages()().length }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .demo-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    .config-controls {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .config-controls label {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .config-controls input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 120px;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    button {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    button:hover:not(:disabled) {
      background-color: #0056b3;
    }

    button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .delete-btn {
      background-color: #dc3545;
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
    }

    .delete-btn:hover:not(:disabled) {
      background-color: #c82333;
    }

    .loading, .uploading {
      text-align: center;
      padding: 1rem;
      background-color: #e7f3ff;
      border-radius: 4px;
      margin: 1rem 0;
    }

    .progress-bar {
      width: 100%;
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background-color: #007bff;
      transition: width 0.3s ease;
    }

    .message {
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .message.error {
      background-color: #f8d7da;
      color: #721c24;
      border-color: #f5c6cb;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .image-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background-color: white;
    }

    .image-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .image-details {
      padding: 1rem;
    }

    .image-details h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .image-details p {
      margin: 0.25rem 0;
      font-size: 0.875rem;
      color: #666;
    }

    .tags {
      margin: 0.5rem 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .tag {
      background-color: #e9ecef;
      color: #495057;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.75rem;
    }

    .no-images {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 2rem;
    }

    .state-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .state-info p {
      margin: 0.25rem 0;
      padding: 0.5rem;
      background-color: white;
      border-radius: 4px;
    }
  `]
})
export class MockApiDemoComponent implements OnInit {
  readonly imageService = inject(ImageService);
  readonly mockApiService = inject(MockApiService);

  readonly images = signal<ImageData[]>([]);
  readonly loading = signal(false);
  readonly uploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly lastMessage = signal('');
  readonly isError = signal(false);

  delayMs = 1000;
  successRate = 0.9;

  ngOnInit(): void {
    this.loadConfig();
  }

  private loadConfig(): void {
    const config = this.mockApiService.getConfig();
    this.delayMs = config.delayMs;
    this.successRate = config.successRate;
  }

  updateConfig(): void {
    this.mockApiService.updateConfig({
      delayMs: this.delayMs,
      successRate: this.successRate
    });
    this.setMessage(`Configuration updated - Delay: ${this.delayMs}ms, Success Rate: ${this.successRate * 100}%`);
  }

  async loadImages(): Promise<void> {
    this.loading.set(true);
    this.clearMessage();

    try {
      const response = await this.imageService.loadImages().toPromise();
      if (response?.success && response.data) {
        this.images.set(response.data);
        this.setMessage(`Loaded ${response.data.length} images successfully`);
      } else {
        throw new Error(response?.message || 'Failed to load images');
      }
    } catch (error) {
      this.setMessage('Failed to load images', true);
      console.error('Error loading images:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async searchImages(): Promise<void> {
    this.loading.set(true);
    this.clearMessage();

    try {
      const response = await this.imageService.searchImages('sample').toPromise();
      if (response?.success && response.data) {
        this.images.set(response.data);
        this.setMessage(`Found ${response.data.length} images matching "sample"`);
      } else {
        throw new Error(response?.message || 'Search failed');
      }
    } catch (error) {
      this.setMessage('Search failed', true);
      console.error('Error searching images:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async uploadMockFiles(): Promise<void> {
    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.clearMessage();

    // Create mock files
    const mockFiles = [
      new File(['mock content 1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['mock content 2'], 'test2.png', { type: 'image/png' })
    ];

    try {
      // Start progress simulation
      this.simulateProgress();

      const response = await this.imageService.uploadImages(mockFiles).toPromise();
      if (response?.success && response.data) {
        this.setMessage(`Successfully uploaded ${response.data.uploadedImages.length} files`);
        // Reload images to show updates
        await this.loadImages();
      } else {
        throw new Error(response?.message || 'Upload failed');
      }
    } catch (error) {
      this.setMessage('Upload failed', true);
      console.error('Error uploading files:', error);
    } finally {
      this.uploading.set(false);
      this.uploadProgress.set(0);
    }
  }

  async deleteImage(id: string): Promise<void> {
    this.clearMessage();

    try {
      const response = await this.imageService.deleteImage(id).toPromise();
      if (response?.success) {
        this.setMessage('Image deleted successfully');
        // Remove from local state
        this.images.update(current => current.filter(img => img.id !== id));
      } else {
        throw new Error(response?.message || 'Delete failed');
      }
    } catch (error) {
      this.setMessage('Failed to delete image', true);
      console.error('Error deleting image:', error);
    }
  }

  reset(): void {
    this.images.set([]);
    this.imageService.reset();
    this.clearMessage();
    this.setMessage('Reset completed');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private setMessage(message: string, error = false): void {
    this.lastMessage.set(message);
    this.isError.set(error);
    setTimeout(() => this.clearMessage(), 5000);
  }

  private clearMessage(): void {
    this.lastMessage.set('');
    this.isError.set(false);
  }

  private simulateProgress(): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      this.uploadProgress.set(Math.round(progress));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      this.uploadProgress.set(100);
    }, 1500);
  }
}
