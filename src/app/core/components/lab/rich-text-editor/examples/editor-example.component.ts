import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RichTextEditorComponent } from '../rich-text-editor.component';
import type { EditorConfig } from '../models/editor-config.model';

/**
 * Example component demonstrating programmatic usage of the Rich Text Editor
 */
@Component({
  selector: 'app-editor-example',
  standalone: true,
  imports: [RichTextEditorComponent],
  template: `
    <div class="example-container">
      <h3>Blog Post Editor Example</h3>
      <p>Configuration optimized for blog post writing:</p>

      <app-rich-text-editor [config]="blogConfig" />

      <h3>Comment Editor Example</h3>
      <p>Minimal configuration for user comments:</p>

      <app-rich-text-editor [config]="commentConfig" />
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;

      h3 {
        color: #333;
        margin: 20px 0 10px 0;
      }

      p {
        color: #666;
        margin-bottom: 15px;
      }

      app-rich-text-editor {
        margin-bottom: 30px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorExampleComponent {
  // Blog post configuration - full featured
  readonly blogConfig: EditorConfig = {
    toolbar: {
      enableLinkTool: true,
      enableBoldTool: true,
      enableItalicTool: true,
      enableUnderlineTool: true,
      enableBulletListTool: true,
      enableNumberedListTool: true,
      enableDebugTool: false,
    },
    linkTool: {
      linkPlaceholder: 'https://example.com/reference',
      linkAriaLabel: 'Add reference link',
      linkButtonText: '🔗 Add Link',
    },
    initialContent: '<ul class="list-disc"><li>Start writing your blog post here...</li></ul>',
    spellcheck: true,
    editorAriaLabel: 'Blog post content editor',
  };

  // Comment configuration - minimal features
  readonly commentConfig: EditorConfig = {
    toolbar: {
      enableLinkTool: true,
      enableBoldTool: false,
      enableItalicTool: false,
      enableUnderlineTool: false,
      enableBulletListTool: false,
      enableNumberedListTool: false,
      enableDebugTool: false,
    },
    linkTool: {
      linkPlaceholder: 'https://...',
      linkButtonText: '🔗',
    },
    initialContent: '<ul class="list-disc"><li>Write your comment...</li></ul>',
    spellcheck: true,
    editorAriaLabel: 'Comment editor',
  };
}
