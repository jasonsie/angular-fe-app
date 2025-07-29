import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  input,
  afterNextRender,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextEditorComponent {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;
  htmlStringData = input<string>('');
  htmlString = signal<string>('');

  constructor() {
    afterNextRender(() => {
      this.initHandler();
    });
  }

  /**
   * Initializes the editor content and focuses the editor.
   * Handles undefined or incomplete htmlString gracefully.
   */
  initHandler(): void {
    const html = this.sanitizeHtmlString(this.htmlStringData());
    this.editorRef.nativeElement.innerHTML = html;
  }

  /**
   * Sanitizes the htmlString input, providing a fallback if undefined or incomplete.
   * @param html The input HTML string
   */
  private sanitizeHtmlString(html: string | undefined | null): string {
    if (!html || typeof html !== 'string' || !html.trim()) {
      // Fallback to a default bullet list if htmlString is missing or empty
      return '<ul class="list-disc"><li></li></ul>';
    }

    return html;
  }

  addLink() {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      this.editorRef.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    // Always keep bullet list as default and Enter creates a new <li>
    if (event.key === 'Enter') {
      event.preventDefault();
      const editor = this.editorRef.nativeElement;
      // Check if the structure is <ul class="list-disc"> with <li> children
      const ul = editor.querySelector('ul.list-disc');
      const allLis = ul
        ? Array.from(ul.children).every((child) => child.tagName === 'LI')
        : false;
      if (!ul || !allLis) {
        // Patch to correct structure, preserve text if possible
        let text = editor.textContent || '';
        // Split by newlines or just wrap in one <li>
        const items = text
          .split(/\n|\r/)
          .map((t) => t.trim())
          .filter(Boolean);
        const liHtml = items.length
          ? items.map((t) => `<li>${t}</li>`).join('')
          : '<li></li>';
        editor.innerHTML = `<ul class="list-disc">${liHtml}</ul>`;
        // Move caret to the last <li>
        const lastLi = editor.querySelector('ul.list-disc li:last-child');
        if (lastLi) {
          const range = document.createRange();
          range.selectNodeContents(lastLi);
          range.collapse(false);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
        return;
      }
      // Structure is correct, insert a new <li> after current
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let li: Node | null = range.startContainer;
        // Find the closest <li>
        while (
          li &&
          (li.nodeType !== 1 || (li as HTMLElement).tagName !== 'LI')
        ) {
          li = (li.parentNode as Node) ?? null;
        }
        if (li && li.parentNode && (li as HTMLElement).tagName === 'LI') {
          const newLi = document.createElement('li');
          li.parentNode.insertBefore(newLi, li.nextSibling);
          // Move caret to new <li>
          const newRange = document.createRange();
          newRange.selectNodeContents(newLi);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
  }

  printHtml() {
    // Get the editor content
    let content = this.editorRef.nativeElement.innerHTML.trim();
    this.htmlString.set(content);
  }
}
