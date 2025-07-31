import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LabComponent } from './lab.component';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { By } from '@angular/platform-browser';

describe('LabComponent', () => {
  let component: LabComponent;
  let fixture: ComponentFixture<LabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        LabComponent,
        RichTextEditorComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize reactive form with proper validators', () => {
    expect(component.editorForm).toBeDefined();
    expect(component.editorForm.get('defaultEditor')).toBeTruthy();
    expect(component.editorForm.get('autoTransformEditor')).toBeTruthy();
    expect(component.editorForm.get('disabledBulletEditor')).toBeTruthy();

    // Check validators
    const defaultEditor = component.editorForm.get('defaultEditor');
    expect(defaultEditor?.hasError('required')).toBeTruthy();
  });

  it('should handle content change from default editor', () => {
    const testContent = '<p>Test content for default editor</p>';
    component.onDefaultEditorContentChange(testContent);

    expect(component.editorForm.get('defaultEditor')?.value).toBe(testContent);
  });

  it('should handle content change from auto-transform editor', () => {
    const testContent = '<ol><li>Auto transform test</li></ol>';
    component.onAutoTransformEditorContentChange(testContent);

    expect(component.editorForm.get('autoTransformEditor')?.value).toBe(testContent);
  });

  it('should handle content change from disabled bullet editor', () => {
    const testContent = '<ul><li>Disabled bullet test</li></ul>';
    component.onDisabledBulletEditorContentChange(testContent);

    expect(component.editorForm.get('disabledBulletEditor')?.value).toBe(testContent);
  });

  it('should validate minimum length requirement', () => {
    const shortContent = 'short';
    const longContent = 'This is a long enough content that meets the minimum length requirement';

    component.onDefaultEditorContentChange(shortContent);
    expect(component.editorForm.get('defaultEditor')?.hasError('minlength')).toBeTruthy();

    component.onDefaultEditorContentChange(longContent);
    expect(component.editorForm.get('defaultEditor')?.hasError('minlength')).toBeFalsy();
  });

  it('should show error messages correctly', () => {
    // Test required error
    expect(component.getErrorMessage('defaultEditor')).toBe('Default Editor is required');

    // Test minlength error
    const control = component.editorForm.get('defaultEditor');
    control?.setValue('short');
    control?.markAsTouched();

    expect(component.getErrorMessage('defaultEditor')).toBe('Default Editor must be at least 10 characters long');
  });

  it('should determine when to show errors', () => {
    const control = component.editorForm.get('defaultEditor');

    // Should not show error initially
    expect(component.shouldShowError('defaultEditor')).toBeFalsy();

    // Should show error when touched and invalid
    control?.markAsTouched();
    expect(component.shouldShowError('defaultEditor')).toBeTruthy();

    // Should show error when form is submitted and invalid
    control?.markAsUntouched();
    component.formSubmitted.set(true);
    expect(component.shouldShowError('defaultEditor')).toBeTruthy();
  });

  it('should handle form submission correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    // Test invalid form submission
    component.onSubmit();
    expect(component.formSubmitted()).toBeTruthy();
    expect(consoleSpy).toHaveBeenCalledWith('Form is invalid');

    // Test valid form submission
    component.editorForm.patchValue({
      defaultEditor: 'Valid content for default editor',
      autoTransformEditor: 'Valid content for auto transform editor',
      disabledBulletEditor: 'Valid content for disabled bullet editor'
    });

    component.onSubmit();
    expect(component.formData()).toEqual(component.editorForm.value);
    expect(consoleSpy).toHaveBeenCalledWith('Form Data:', component.editorForm.value);

    consoleSpy.mockRestore();
  });

  it('should reset form correctly', () => {
    // Set some values
    component.editorForm.patchValue({
      defaultEditor: 'Some content',
      autoTransformEditor: 'Some other content'
    });
    component.formSubmitted.set(true);
    component.formData.set({ test: 'data' });

    // Reset form
    component.onReset();

    expect(component.editorForm.get('defaultEditor')?.value).toBeNull();
    expect(component.formSubmitted()).toBeFalsy();
    expect(component.formData()).toBeNull();
  });

  it('should render form with proper structure', () => {
    const formElement = fixture.debugElement.query(By.css('.editor-form'));
    expect(formElement).toBeTruthy();

    const sections = fixture.debugElement.queryAll(By.css('.demo-section'));
    expect(sections.length).toBe(3);

    const editors = fixture.debugElement.queryAll(By.css('app-rich-text-editor'));
    expect(editors.length).toBe(3);

    const submitButton = fixture.debugElement.query(By.css('.submit-btn'));
    expect(submitButton).toBeTruthy();

    const resetButton = fixture.debugElement.query(By.css('.reset-btn'));
    expect(resetButton).toBeTruthy();
  });
});
