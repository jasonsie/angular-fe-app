import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload.component';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
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
});
