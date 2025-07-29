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

interface PopoverPosition {
  top: number;
  left: number;
}

const DEFAULT_BULLET_LIST = '<ul class="list-disc"><li></li></ul>';

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

  readonly DefaultUL = DEFAULT_BULLET_LIST;
  readonly initialContent = input<string>(DEFAULT_BULLET_LIST);
  readonly htmlString = signal<string>('');

  // Link input popover state
  readonly showLinkPopover = signal(false);
  readonly linkPopoverPosition = signal<PopoverPosition | null>(null);
  readonly linkInputValue = signal('');
  readonly editingLinkNode = signal<HTMLAnchorElement | null>(null);

  // Link actions popover state
  readonly showLinkActionsPopover = signal(false);
  readonly linkActionsPosition = signal<PopoverPosition | null>(null);
  readonly hoveredLinkNode = signal<HTMLAnchorElement | null>(null);

  private savedRange: Range | null = null;

  constructor() {
    afterNextRender(() => {
      this.initializeEditor();
      this.attachEventListeners();
    });
  }

  /**
   * Initializes the editor with content and sets up event listeners.
   */
  private initializeEditor(): void {
    const content = this.sanitizeContent(this.initialContent());
    this.editorRef.nativeElement.innerHTML = content;
  }

  /**
   * Attaches event listeners for link detection.
   */
  private attachEventListeners(): void {
    const editor = this.editorRef.nativeElement;
    editor.addEventListener('mouseup', this.handleCaretInLink);
    editor.addEventListener('keyup', this.handleCaretInLink);
  }

  /**
   * Handles caret position changes to show link actions popover when inside a link.
   */
  private handleCaretInLink = (): void => {
    const selection = window.getSelection();
    if (!selection?.anchorNode) {
      this.hideLinkActionsPopover();
      return;
    }

    const linkElement = this.findAnchorElement(selection.anchorNode);
    if (linkElement) {
      this.showLinkActionsPopoverAt(linkElement);
    } else {
      this.hideLinkActionsPopover();
    }
  };

  /**
   * Finds the closest anchor element from a given node.
   */
  private findAnchorElement(node: Node): HTMLAnchorElement | null {
    let currentNode: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    
    while (currentNode && currentNode !== this.editorRef.nativeElement) {
      if ((currentNode as HTMLElement).tagName === 'A') {
        return currentNode as HTMLAnchorElement;
      }
      currentNode = currentNode.parentNode;
    }
    
    return null;
  }

  /**
   * Shows the link actions popover at the specified link element.
   */
  private showLinkActionsPopoverAt(linkElement: HTMLAnchorElement): void {
    const position = this.calculatePopoverPosition(linkElement);
    this.linkActionsPosition.set(position);
    this.hoveredLinkNode.set(linkElement);
    this.showLinkActionsPopover.set(true);
  }

  /**
   * Hides the link actions popover.
   */
  private hideLinkActionsPopover(): void {
    this.showLinkActionsPopover.set(false);
    this.hoveredLinkNode.set(null);
  }

  /**
   * Calculates popover position relative to editor.
   */
  private calculatePopoverPosition(element: HTMLElement): PopoverPosition;
  private calculatePopoverPosition(rect: DOMRect): PopoverPosition;
  private calculatePopoverPosition(elementOrRect: HTMLElement | DOMRect): PopoverPosition {
    const rect = elementOrRect instanceof HTMLElement 
      ? elementOrRect.getBoundingClientRect() 
      : elementOrRect;
    const editorRect = this.editorRef.nativeElement.getBoundingClientRect();
    
    return {
      top: rect.bottom - editorRect.top + 4,
      left: rect.left - editorRect.left,
    };
  }

  /**
   * Sanitizes and validates the input content.
   */
  private sanitizeContent(content: string | undefined | null): string {
    if (!content?.trim()) {
      return DEFAULT_BULLET_LIST;
    }
    return content;
  }

  /**
   * Initiates the link creation process by showing the link input popover.
   */
  addLink(): void {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    this.savedRange = range.cloneRange();
    
    const position = this.calculatePopoverPosition(range.getBoundingClientRect());
    this.linkPopoverPosition.set(position);
    this.linkInputValue.set('');
    this.editingLinkNode.set(null);
    this.showLinkPopover.set(true);
    
    this.focusLinkInput();
  }

  /**
   * Applies the link to the selected text or updates an existing link.
   */
  applyLink(): void {
    const url = this.linkInputValue().trim();
    if (!url) {
      this.closeLinkPopover();
      return;
    }

    const editingNode = this.editingLinkNode();
    if (editingNode) {
      this.updateExistingLink(editingNode, url);
    } else {
      this.createNewLink(url);
    }
    
    this.closeLinkPopover();
    this.editorRef.nativeElement.focus();
  }

  /**
   * Updates an existing link's href attribute.
   */
  private updateExistingLink(linkElement: HTMLAnchorElement, url: string): void {
    linkElement.href = url;
  }

  /**
   * Creates a new link element for the selected text.
   */
  private createNewLink(url: string): void {
    if (!this.savedRange || this.savedRange.collapsed) {
      return;
    }

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(this.savedRange);

    const anchor = this.createAnchorElement(url, this.savedRange.toString());
    this.savedRange.deleteContents();
    this.savedRange.insertNode(anchor);
    
    this.moveCaretAfterElement(anchor);
  }

  /**
   * Creates a new anchor element with proper attributes.
   */
  private createAnchorElement(href: string, textContent: string): HTMLAnchorElement {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = textContent;
    return anchor;
  }

  /**
   * Moves the caret to after the specified element.
   */
  private moveCaretAfterElement(element: HTMLElement): void {
    const range = document.createRange();
    range.setStartAfter(element);
    range.collapse(true);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  /**
   * Focuses the link input field after a short delay.
   */
  private focusLinkInput(): void {
    setTimeout(() => {
      const input = document.getElementById('link-input-box') as HTMLInputElement;
      input?.focus();
    }, 0);
  }

  /**
   * Closes the link input popover and resets its state.
   */
  closeLinkPopover(): void {
    this.showLinkPopover.set(false);
    this.linkInputValue.set('');
    this.editingLinkNode.set(null);
    this.savedRange = null;
  }

  /**
   * Opens the link editing popover for an existing link.
   */
  onEditLink(): void {
    const link = this.hoveredLinkNode();
    if (!link) return;

    const position = this.calculatePopoverPosition(link);
    this.linkPopoverPosition.set(position);
    this.linkInputValue.set(link.href);
    this.editingLinkNode.set(link);
    this.showLinkPopover.set(true);
    this.showLinkActionsPopover.set(false);
    
    this.focusLinkInput();
  }

  /**
   * Opens the current link in a new tab.
   */
  onGoToLink(): void {
    const link = this.hoveredLinkNode();
    if (link?.href) {
      window.open(link.href, '_blank', 'noopener');
    }
  }

  /**
   * Removes the link while preserving its text content.
   */
  onRemoveLink(): void {
    const link = this.hoveredLinkNode();
    if (!link?.parentNode) return;

    // Move all child nodes before the link, then remove the link
    while (link.firstChild) {
      link.parentNode.insertBefore(link.firstChild, link);
    }
    link.parentNode.removeChild(link);
    
    this.hideLinkActionsPopover();
  }

  /**
   * Handles keyboard events, specifically Enter key for creating new list items.
   */
  onKeyDown(event: KeyboardEvent): void {
    this.hideLinkActionsPopover();

    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleEnterKey();
    }
  }

  /**
   * Handles Enter key press to create new list items or fix list structure.
   */
  private handleEnterKey(): void {
    const editor = this.editorRef.nativeElement;
    const ul = editor.querySelector('ul.list-disc');
    const hasValidStructure = ul && this.hasValidListStructure(ul);

    if (!hasValidStructure) {
      this.fixListStructure(editor);
      return;
    }

    this.insertNewListItem();
  }

  /**
   * Checks if the list has valid structure (all children are LI elements).
   */
  private hasValidListStructure(ul: Element): boolean {
    return Array.from(ul.children).every(child => child.tagName === 'LI');
  }

  /**
   * Fixes the list structure by wrapping content in proper UL/LI elements.
   */
  private fixListStructure(editor: HTMLElement): void {
    const text = editor.textContent || '';
    const items = text.split(/\n|\r/).map(t => t.trim()).filter(Boolean);
    const liHtml = items.length 
      ? items.map(item => `<li>${item}</li>`).join('') 
      : '<li></li>';
    
    editor.innerHTML = `<ul class="list-disc">${liHtml}</ul>`;
    this.focusLastListItem(editor);
  }

  /**
   * Inserts a new list item after the current one.
   */
  private insertNewListItem(): void {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const currentLi = this.findCurrentListItem(selection.getRangeAt(0));
    if (currentLi?.parentNode) {
      const newLi = document.createElement('li');
      currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
      this.focusElement(newLi);
    }
  }

  /**
   * Finds the current list item from the selection range.
   */
  private findCurrentListItem(range: Range): HTMLElement | null {
    let node: Node | null = range.startContainer;
    
    while (node && (node.nodeType !== 1 || (node as HTMLElement).tagName !== 'LI')) {
      node = node.parentNode;
    }
    
    return node as HTMLElement | null;
  }

  /**
   * Focuses the last list item in the editor.
   */
  private focusLastListItem(editor: HTMLElement): void {
    const lastLi = editor.querySelector('ul.list-disc li:last-child');
    if (lastLi) {
      this.focusElement(lastLi as HTMLElement);
    }
  }

  /**
   * Focuses an element by placing the caret at the end of its content.
   */
  private focusElement(element: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  /**
   * Prints the current HTML content to the htmlString signal for debugging.
   */
  printHtml(): void {
    const content = this.editorRef.nativeElement.innerHTML.trim();
    this.htmlString.set(content);
  }
}
