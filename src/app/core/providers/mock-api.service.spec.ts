import { TestBed } from '@angular/core/testing';
import { MockApiService } from './mock-api.service';
import { ImageService } from './image.service';

describe('MockApiService', () => {
  let service: MockApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mock images', (done) => {
    service.getImages().subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.length).toBe(4);
      expect(response.data[0].filename).toBe('0101308.png');
      done();
    });
  });

  it('should find image by id', (done) => {
    service.getImageById('1').subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe('1');
      done();
    });
  });

  it('should return null for non-existent image', (done) => {
    service.getImageById('999').subscribe(response => {
      expect(response.success).toBe(false);
      expect(response.data).toBe(null);
      done();
    });
  });

  it('should simulate upload', (done) => {
    const mockFiles = [
      new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    ];

    service.uploadImages(mockFiles).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data.uploadedImages.length).toBe(1);
      expect(response.data.uploadedImages[0].filename).toBe('test.jpg');
      done();
    });
  });

  it('should search images by query', (done) => {
    service.searchImages('sample').subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should update configuration', () => {
    const newConfig = { delayMs: 500, successRate: 0.8 };
    service.updateConfig(newConfig);

    const config = service.getConfig();
    expect(config.delayMs).toBe(500);
    expect(config.successRate).toBe(0.8);
  });
});

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide mock images immediately', () => {
    const mockImages = service.getMockImages();
    expect(mockImages.length).toBe(4);
    expect(mockImages[0].filename).toBe('0101308.png');
  });

  it('should track loading state', () => {
    expect(service.isLoading()).toBe(false);
    expect(service.isUploading()).toBe(false);
  });
});
