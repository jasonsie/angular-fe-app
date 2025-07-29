import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  input,
  afterNextRender,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorToolbarComponent } from './components/editor-toolbar/editor-toolbar.component';
import { LinkState } from './components/link-tool/link-tool.component';
import {
  EditorConfig,
  DEFAULT_EDITOR_CONFIG,
  EditorToolbarConfig,
  LinkToolConfig
} from './models/editor-config.model';

const DEFAULT_BULLET_LIST = '<ul class="list-disc"><li></li></ul>';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, EditorToolbarComponent],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextEditorComponent {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  // Configuration inputs
  readonly config = input<EditorConfig>(DEFAULT_EDITOR_CONFIG);

  // Computed configuration properties
  readonly toolbarConfig = computed<EditorToolbarConfig>(() =>
    this.config().toolbar || DEFAULT_EDITOR_CONFIG.toolbar!
  );

  readonly linkToolConfig = computed<LinkToolConfig>(() =>
    this.config().linkTool || DEFAULT_EDITOR_CONFIG.linkTool!
  );

  readonly initialContent = computed(() =>
    this.config().initialContent || DEFAULT_BULLET_LIST
  );

  // Editor state
  readonly htmlString = signal<string>('');

  // Link management state
  readonly linkState = signal<LinkState>({
    showLinkPanel: false,
    linkInputValue: '',
    editingLinkNode: null,
    hoveredLinkNode: null,
  });

  private savedRange: Range | null = null;

  /**
   * Helper method to update link state immutably
   */
  private updateLinkState(updates: Partial<LinkState>): void {
    this.linkState.update(current => ({ ...current, ...updates }));
  }

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
   * Handles caret position changes to detect when inside a link.
   */
  private handleCaretInLink = (): void => {
    const selection = window.getSelection();
    if (!selection?.anchorNode) {
      this.updateLinkState({ hoveredLinkNode: null });
      return;
    }

    const linkElement = this.findAnchorElement(selection.anchorNode);
    this.updateLinkState({ hoveredLinkNode: linkElement });
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
   * Sanitizes and validates the input content.
   */
  private sanitizeContent(content: string | undefined | null): string {
    if (!content?.trim()) {
      return DEFAULT_BULLET_LIST;
    }
    return content;
  }

  /**
   * Toolbar event handlers - these delegate to the appropriate state management methods
   */

  onAddLink(): void {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    this.savedRange = range.cloneRange();

    this.updateLinkState({
      linkInputValue: '',
      editingLinkNode: null,
      showLinkPanel: true,
    });

    this.focusLinkInput();
  }

  onApplyLink(url: string): void {
    if (!url.trim()) {
      this.onCancelLink();
      return;
    }

    const currentState = this.linkState();
    if (currentState.editingLinkNode) {
      this.updateExistingLink(currentState.editingLinkNode, url);
    } else {
      this.createNewLink(url);
    }

    this.onCancelLink();
    this.editorRef.nativeElement.focus();
  }

  onCancelLink(): void {
    this.updateLinkState({
      showLinkPanel: false,
      linkInputValue: '',
      editingLinkNode: null,
    });
    this.savedRange = null;
  }

  onEditLink(link: HTMLAnchorElement): void {
    this.updateLinkState({
      linkInputValue: link.href,
      editingLinkNode: link,
      showLinkPanel: true,
    });

    this.focusLinkInput();
  }

  onGoToLink(link: HTMLAnchorElement): void {
    if (link.href) {
      window.open(link.href, '_blank', 'noopener');
    }
  }

  onRemoveLink(link: HTMLAnchorElement): void {
    if (!link.parentNode) return;

    // Move all child nodes before the link, then remove the link
    while (link.firstChild) {
      link.parentNode.insertBefore(link.firstChild, link);
    }
    link.parentNode.removeChild(link);

    this.updateLinkState({ hoveredLinkNode: null });
  }

  onLinkInputChange(value: string): void {
    this.updateLinkState({ linkInputValue: value });
  }

  onPrintHtml(): void {
    const content = this.editorRef.nativeElement.innerHTML.trim();
    this.htmlString.set(content);
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
   * Handles keyboard events, specifically Enter key for creating new list items.
   */
  onKeyDown(event: KeyboardEvent): void {
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
}
