import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import type { EditorConfig } from './rich-text-editor/models/editor-config.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
      'This is the pure string',
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

  constructor() {}

  ngOnInit() {
    // Initialization logic can go here
  }
}
