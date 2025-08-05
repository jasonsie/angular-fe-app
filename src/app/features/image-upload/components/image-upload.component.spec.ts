import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload.component';
import { ImageService } from '../../../core/providers/image.service';
import { ImageData } from '../../../core/models/api.model';

interface ImageFile {
  file: File;
  url: string;
  id: string;
}

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;
  let mockImageService: jasmine.SpyObj<ImageService>;

  beforeEach(async () => {
    const imageServiceSpy = jasmine.createSpyObj('ImageService', [
      'getMockImages',
      'fetchAndUpdateImages',
      'uploadImages',
      'loadImages',
      'searchImages'
    ], {
      images: jasmine.createSpy('images').and.returnValue([]),
      isLoading: jasmine.createSpy('isLoading').and.returnValue(false),
      isUploading: jasmine.createSpy('isUploading').and.returnValue(false)
    });

    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent],
      providers: [
        { provide: ImageService, useValue: imageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    mockImageService = TestBed.inject(ImageService) as jasmine.SpyObj<ImageService>;

    // Setup default mock returns
    mockImageService.getMockImages.and.returnValue([]);
    mockImageService.fetchAndUpdateImages.and.returnValue(Promise.resolve());

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty state', () => {
    expect(component.selectedImages()).toEqual([]);
    expect(component.isDragOver()).toBe(false);
    expect(component.isUploading()).toBe(false);
    expect(component.uploadProgress()).toBe(0);
    expect(component.uploadMessage()).toBe('');
  });

  it('should handle drag over event', () => {
    const event = new DragEvent('dragover');
    spyOn(event, 'preventDefault');

    component.onDragOver(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.isDragOver()).toBe(true);
  });

  it('should handle drag leave event', () => {
    const event = new DragEvent('dragleave');
    spyOn(event, 'preventDefault');

    component.onDragLeave(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.isDragOver()).toBe(false);
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(0)).toBe('0 Bytes');
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1048576)).toBe('1 MB');
  });

  it('should clear all images', () => {
    // Add mock images
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockUrl = 'blob:http://localhost/test';
    spyOn(URL, 'createObjectURL').and.returnValue(mockUrl);
    spyOn(URL, 'revokeObjectURL');

    component['handleFiles']([mockFile]);
    expect(component.selectedImages().length).toBe(1);

    component.clearImages();

    expect(component.selectedImages().length).toBe(0);
    expect(component.uploadProgress()).toBe(0);
    expect(component.uploadMessage()).toBe('');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });

  describe('downloadImage', () => {
    let mockDocumentBody: jasmine.SpyObj<HTMLElement>;
    let mockAnchor: jasmine.SpyObj<HTMLAnchorElement>;

    beforeEach(() => {
      mockAnchor = jasmine.createSpyObj('a', ['click']);
      spyOn(document, 'createElement').and.returnValue(mockAnchor as any);
      mockDocumentBody = jasmine.createSpyObj('body', ['appendChild', 'removeChild']);
      spyOnProperty(document, 'body', 'get').and.returnValue(mockDocumentBody as any);
    });

    it('should download user-uploaded image', () => {
      const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
      const imageFile: ImageFile = {
        file: mockFile,
        url: 'blob:http://localhost/test-url',
        id: 'test-id'
      };

      component.downloadImage(imageFile);

      expect(mockAnchor.href).toBe('blob:http://localhost/test-url');
      expect(mockAnchor.download).toBe('test-image.jpg');
      expect(mockAnchor.style.display).toBe('none');
      expect(mockDocumentBody.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockDocumentBody.removeChild).toHaveBeenCalledWith(mockAnchor);
    });

    it('should download backend image with base64 data', () => {
      const imageData: ImageData = {
        id: 'base64-test',
        filename: 'base64-image.png',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        size: 95,
        mimeType: 'image/png',
        isBase64: true
      };

      component.downloadImage(imageData);

      expect(mockAnchor.href).toBe(imageData.url);
      expect(mockAnchor.download).toBe('base64-image.png');
      expect(mockDocumentBody.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockDocumentBody.removeChild).toHaveBeenCalledWith(mockAnchor);
    });

    it('should download backend image with URL', async () => {
      const imageData: ImageData = {
        id: 'url-test',
        filename: 'url-image.jpg',
        url: 'https://example.com/image.jpg',
        size: 1024
      };

      const mockBlob = new Blob(['mock image data'], { type: 'image/jpeg' });
      const mockObjectUrl = 'blob:http://localhost/mock-object-url';

      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve(new Response(mockBlob, {
          status: 200,
          headers: new Headers({ 'content-type': 'image/jpeg' })
        }))
      );
      spyOn(URL, 'createObjectURL').and.returnValue(mockObjectUrl);
      spyOn(URL, 'revokeObjectURL');

      await component.downloadImage(imageData);

      expect(fetch).toHaveBeenCalledWith('https://example.com/image.jpg');
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockAnchor.href).toBe(mockObjectUrl);
      expect(mockAnchor.download).toBe('url-image.jpg');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
    });

    it('should handle filename without extension for base64 images', () => {
      const imageData: ImageData = {
        id: 'no-ext-test',
        filename: 'image-without-extension',
        url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
        size: 150
      };

      component.downloadImage(imageData);

      expect(mockAnchor.download).toBe('image-without-extension.jpg');
    });

    it('should handle missing filename for base64 images', () => {
      const imageData: ImageData = {
        id: 'missing-filename-test',
        filename: '',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        size: 95
      };

      component.downloadImage(imageData);

      expect(mockAnchor.download).toBe('image_missing-filename-test.png');
    });

    it('should handle fetch errors gracefully', async () => {
      const imageData: ImageData = {
        id: 'error-test',
        filename: 'error-image.jpg',
        url: 'https://example.com/nonexistent.jpg',
        size: 1024
      };

      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve(new Response(null, { status: 404 }))
      );
      spyOn(console, 'error');

      try {
        await component.downloadImage(imageData);
      } catch (error) {
        expect(error).toBeDefined();
      }

      expect(fetch).toHaveBeenCalledWith('https://example.com/nonexistent.jpg');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should detect base64 images correctly', () => {
      expect(component['isBase64Image']('data:image/png;base64,iVBORw0K...')).toBe(true);
      expect(component['isBase64Image']('data:image/jpeg;base64,/9j/4AAQ...')).toBe(true);
      expect(component['isBase64Image']('https://example.com/image.jpg')).toBe(false);
      expect(component['isBase64Image']('/path/to/image.png')).toBe(false);
    });

    it('should extract MIME type from base64 URL', () => {
      expect(component['getMimeTypeFromBase64']('data:image/png;base64,iVBORw0K...')).toBe('image/png');
      expect(component['getMimeTypeFromBase64']('data:image/jpeg;base64,/9j/4AAQ...')).toBe('image/jpeg');
      expect(component['getMimeTypeFromBase64']('https://example.com/image.jpg')).toBeUndefined();
    });

    it('should get file extension correctly', () => {
      expect(component['getFileExtension']('image.jpg')).toBe('jpg');
      expect(component['getFileExtension']('photo.png')).toBe('png');
      expect(component['getFileExtension']('image', 'image/jpeg')).toBe('jpg');
      expect(component['getFileExtension']('image', 'image/png')).toBe('png');
      expect(component['getFileExtension']('image')).toBe('jpg'); // default fallback
    });
  });
});
