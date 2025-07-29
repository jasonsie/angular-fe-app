import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  input,
  afterNextRender,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export const DefaultUL: string = '<ul class="list-disc"><li></li></ul>';

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

  DefaultUL = DefaultUL;
  htmlStringData = input<string>(
    '<ul class="list-disc"><li><a href="https://www.google.com/" target="_blank" rel="noopener noreferrer">link</a></li></ul>'
  );
  htmlString = signal<string>('');

  // Popover state for link input
  showLinkPopover = signal(false);
  linkPopoverPosition = signal<{ top: number; left: number } | null>(null);
  linkInputValue = signal('');
  editingLinkNode = signal<HTMLAnchorElement | null>(null);

  // Popover state for link actions (edit/remove)
  showLinkActionsPopover = signal(false);
  linkActionsPosition = signal<{ top: number; left: number } | null>(null);
  hoveredLinkNode = signal<HTMLAnchorElement | null>(null);

  constructor() {
    afterNextRender(() => {
      this.initHandler();
      // Attach caret event listeners for link popover (typing cursor)
      const editor = this.editorRef?.nativeElement;
      if (editor) {
        editor.addEventListener('mouseup', this.handleCaretInLink);
        editor.addEventListener('keyup', this.handleCaretInLink);
      }
    });
  }
  // Show link actions popover if caret is inside a link
  handleCaretInLink = () => {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) {
      this.showLinkActionsPopover.set(false);
      this.hoveredLinkNode.set(null);
      return;
    }
    let node: Node | null = selection.anchorNode;
    // If text node, get parent
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }
    // Traverse up to find <a>
    while (node && (node as HTMLElement).tagName !== 'A' && node !== this.editorRef.nativeElement) {
      node = node.parentNode;
    }
    if (node && (node as HTMLElement).tagName === 'A') {
      const link = node as HTMLAnchorElement;
      const rect = link.getBoundingClientRect();
      const editorRect = this.editorRef.nativeElement.getBoundingClientRect();
      this.linkActionsPosition.set({
        top: rect.bottom - editorRect.top + 4,
        left: rect.left - editorRect.left,
      });
      this.hoveredLinkNode.set(link);
      this.showLinkActionsPopover.set(true);
    } else {
      this.showLinkActionsPopover.set(false);
      this.hoveredLinkNode.set(null);
    }
  };

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
      return DefaultUL;
    }

    return html;
  }

  private savedRange: Range | null = null;

  addLink() {
    // Show popover next to selection and save the range
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }
    const range = selection.getRangeAt(0);
    this.savedRange = range.cloneRange();
    const rect = range.getBoundingClientRect();
    // Position popover below selection
    const editorRect = this.editorRef.nativeElement.getBoundingClientRect();
    this.linkPopoverPosition.set({
      top: rect.bottom - editorRect.top + 4,
      left: rect.left - editorRect.left,
    });
    this.linkInputValue.set('');
    this.editingLinkNode.set(null);
    this.showLinkPopover.set(true);
    setTimeout(() => {
      const input = document.getElementById('link-input-box');
      if (input) (input as HTMLInputElement).focus();
    }, 0);
  }

  applyLink() {
    const url = this.linkInputValue();
    if (!url) {
      this.closeLinkPopover();
      return;
    }
    const editingNode = this.editingLinkNode();
    if (editingNode) {
      editingNode.href = url;
      this.closeLinkPopover();
      this.editorRef.nativeElement.focus();
      return;
    }
    // Restore the saved range and insert the link
    if (this.savedRange) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(this.savedRange);
      // Use Range API to wrap the selected text in an <a>
      const range = this.savedRange;
      if (!range.collapsed) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = range.toString();
        range.deleteContents();
        range.insertNode(anchor);
        // Move caret after the link
        range.setStartAfter(anchor);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
    this.closeLinkPopover();
    this.editorRef.nativeElement.focus();
  }

  closeLinkPopover() {
    this.showLinkPopover.set(false);
    this.linkInputValue.set('');
    this.editingLinkNode.set(null);
    this.savedRange = null;
  }

  // Gmail-style link popover logic
  // (Removed: pointer hover logic, now popover only shows on caret-in-link)

  onEditLink() {
    const link = this.hoveredLinkNode();
    if (!link) return;
    // Show popover for editing, prefill value
    const rect = link.getBoundingClientRect();
    const editorRect = this.editorRef.nativeElement.getBoundingClientRect();
    this.linkPopoverPosition.set({
      top: rect.bottom - editorRect.top + 4,
      left: rect.left - editorRect.left,
    });
    this.linkInputValue.set(link.href);
    this.editingLinkNode.set(link);
    this.showLinkPopover.set(true);
    this.showLinkActionsPopover.set(false);
    setTimeout(() => {
      const input = document.getElementById('link-input-box');
      if (input) (input as HTMLInputElement).focus();
    }, 0);
  }

  onGoToLink() {
    const link = this.hoveredLinkNode();
    if (link) {
      window.open(link.href, '_blank', 'noopener');
    }
  }

  onRemoveLink() {
    const link = this.hoveredLinkNode();
    if (!link) return;
    // Remove <a> but keep text
    const parent = link.parentNode;
    if (parent) {
      while (link.firstChild) {
        parent.insertBefore(link.firstChild, link);
      }
      parent.removeChild(link);
    }
    this.showLinkActionsPopover.set(false);
    this.hoveredLinkNode.set(null);
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
    // Hide popovers on any key
    this.showLinkActionsPopover.set(false);
    this.hoveredLinkNode.set(null);
  }

  printHtml() {
    // Get the editor content
    let content = this.editorRef.nativeElement.innerHTML.trim();
    this.htmlString.set(content);
  }
}
