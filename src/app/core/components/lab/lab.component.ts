import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
} from '@angular/core';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import type { EditorConfig } from './rich-text-editor/models/editor-config.model';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.scss'],
  host: {
    class: 'main-content lab-page',
  },
})
export class LabComponent implements OnInit {
  private readonly fb = new FormBuilder();

  // Reactive form
  readonly editorForm: FormGroup;

  // Signals for form state
  readonly formSubmitted = signal(false);
  readonly formData = signal<any>(null);

  constructor() {
    // Initialize the reactive form
    this.editorForm = this.fb.group({
      defaultEditor: ['', [Validators.required, Validators.minLength(10)]],
      autoTransformEditor: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
      disabledBulletEditor: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }
  // Default configuration (with debug enabled)
  readonly defaultEditorConfig: EditorConfig = {
    toolbar: {
      enableLinkTool: true,
      enableDebugTool: true,
      enableBoldTool: true,
      enableItalicTool: true,
      enableUnderlineTool: true,
      enableBulletListTool: true,
      enableNumberedListTool: true,
    },
    linkTool: {
      linkPlaceholder: 'Enter your URL here...',
      linkAriaLabel: 'Insert hyperlink',
      linkButtonText: '🔗 Insert Link',
    },
    bulletList: {
      listClass: 'list-disc',
      listTag: 'ul',
      autoTransformToBulletList: true, // Don't auto-transform since we're providing HTML
      disableBulletListTool: true, // Disable the button functionality
    },
    initialContent:
        '<ul class="list-disc"><li><a href="https://webmail.nityo.com/#1" target="_blank" rel="noopener noreferrer">Link</a></li><li>Link-2</li></ul>',
    editorAriaLabel: 'Default Rich Text Editor',
  };

  // Auto-transform configuration
  readonly autoTransformConfig: EditorConfig = {
    toolbar: {
      enableLinkTool: true,
      enableDebugTool: true,
      enableBoldTool: true,
      enableItalicTool: true,
      enableUnderlineTool: true,
      enableBulletListTool: true,
      enableNumberedListTool: true,
    },
    bulletList: {
      listClass: 'list-decimal',
      listTag: 'ol',
      autoTransformToBulletList: true,
      disableBulletListTool: false,
    },
    initialContent: `First item
Second item
Third item`,
    editorAriaLabel: 'Auto-Transform Rich Text Editor',
  };

  // Disabled bullet list tool configuration
  readonly disabledBulletConfig: EditorConfig = {
    toolbar: {
      enableLinkTool: true,
      enableDebugTool: true,
      enableBoldTool: true,
      enableItalicTool: true,
      enableUnderlineTool: true,
      enableBulletListTool: true, // This will be overridden by bulletList.disableBulletListTool
      enableNumberedListTool: true,
    },
    bulletList: {
      listClass: 'custom-bullet-list',
      listTag: 'ul',
      autoTransformToBulletList: false,
      disableBulletListTool: true, // This disables the bullet list tool
    },
    initialContent:
      '<ul class="custom-bullet-list"><li>Bullet list tool is disabled</li><li>But bullet lists still work</li></ul>',
    editorAriaLabel: 'Disabled Bullet Tool Rich Text Editor',
  };

  // For backward compatibility, keeping the original property name
  readonly editorConfig = this.defaultEditorConfig;

  ngOnInit() {
    // Initialization logic can go here
  }

  /**
   * Handles content change from the default editor
   */
  onDefaultEditorContentChange(content: string): void {
    this.editorForm.patchValue({ defaultEditor: content });
  }

  /**
   * Handles content change from the auto-transform editor
   */
  onAutoTransformEditorContentChange(content: string): void {
    this.editorForm.patchValue({ autoTransformEditor: content });
  }

  /**
   * Handles content change from the disabled bullet editor
   */
  onDisabledBulletEditorContentChange(content: string): void {
    this.editorForm.patchValue({ disabledBulletEditor: content });
  }

  /**
   * Handles form submission
   */
  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.editorForm.valid) {
      this.formData.set(this.editorForm.value);
      console.log('Form Data:', this.editorForm.value);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  /**
   * Marks all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.editorForm.controls).forEach((key) => {
      this.editorForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Gets validation error message for a form control
   */
  getErrorMessage(controlName: string): string {
    const control = this.editorForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getControlDisplayName(controlName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `${this.getControlDisplayName(
        controlName
      )} must be at least ${requiredLength} characters long`;
    }
    return '';
  }

  /**
   * Gets display name for form control
   */
  private getControlDisplayName(controlName: string): string {
    const displayNames: { [key: string]: string } = {
      defaultEditor: 'Default Editor',
      autoTransformEditor: 'Auto-Transform Editor',
      disabledBulletEditor: 'Disabled Bullet Editor',
    };
    return displayNames[controlName] || controlName;
  }

  /**
   * Checks if a form control has validation errors and should show them
   */
  shouldShowError(controlName: string): boolean {
    const control = this.editorForm.get(controlName);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.formSubmitted())
    );
  }

  /**
   * Resets the form to initial state
   */
  onReset(): void {
    this.editorForm.reset();
    this.formSubmitted.set(false);
    this.formData.set(null);
  }
}
