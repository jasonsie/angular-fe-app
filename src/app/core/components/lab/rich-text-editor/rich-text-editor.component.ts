import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  input,
  output,
  afterNextRender,
  signal,
  computed,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorToolbarComponent } from './components/editor-toolbar/editor-toolbar.component';
import { LinkState } from './components/link-tool/link-tool.component';
import { BulletPointState } from './components/bullet-point-tool/bullet-point-tool.component';
import { BulletPointService } from './services/bullet-point.service';
import {
  EditorConfig,
  DEFAULT_EDITOR_CONFIG,
  EditorToolbarConfig,
  LinkToolConfig,
  BulletListConfig,
} from './models/editor-config.model';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, EditorToolbarComponent],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextEditorComponent implements OnDestroy {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  // Injected services
  private readonly bulletPointService = inject(BulletPointService);

  // Configuration inputs
  readonly config = input<EditorConfig>(DEFAULT_EDITOR_CONFIG);

  // Output events
  readonly contentChange = output<string>();

  // Computed configuration properties
  readonly toolbarConfig = computed<EditorToolbarConfig>(() => {
    const baseConfig = this.config().toolbar || DEFAULT_EDITOR_CONFIG.toolbar!;
    // Return the base config without modifying enableBulletListTool
    // The disableBulletListTool property will be handled in the bullet-point-tool component
    return baseConfig;
  });

  readonly linkToolConfig = computed<LinkToolConfig>(
    () => this.config().linkTool || DEFAULT_EDITOR_CONFIG.linkTool!
  );

  readonly bulletListConfig = computed<BulletListConfig>(
    () => this.config().bulletList || DEFAULT_EDITOR_CONFIG.bulletList!
  );

  readonly initialContent = computed(() => {
    const content = this.config().initialContent;
    const bulletConfig = this.bulletListConfig();

    if (!content?.trim()) {
      return this.bulletPointService.generateDefaultBulletList(bulletConfig);
    }

    // If autoTransformToBulletList is enabled, transform plain text to bullet list
    if (
      bulletConfig.autoTransformToBulletList &&
      !this.bulletPointService.isAlreadyBulletList(content, bulletConfig)
    ) {
      return this.bulletPointService.transformToBulletList(
        content,
        bulletConfig
      );
    }

    return content;
  });

  // Editor state
  readonly htmlString = signal<string>('');

  // Link management state
  readonly linkState = signal<LinkState>({
    showLinkPanel: false,
    linkInputValue: '',
    editingLinkNode: null,
    hoveredLinkNode: null,
  });

  // Bullet point state
  readonly bulletPointState = computed<BulletPointState>(() => {
    if (!this.editorRef?.nativeElement) {
      return {
        isActive: false,
        currentListType: null,
        listItemCount: 0,
      };
    }

    return this.bulletPointService.analyzeBulletPointState(
      this.editorRef.nativeElement,
      this.bulletListConfig()
    );
  });
  private savedRange: Range | null = null;

  /**
   * Helper method to update link state immutably
   */
  private updateLinkState(updates: Partial<LinkState>): void {
    this.linkState.update((current) => ({ ...current, ...updates }));
  }

  constructor() {
    afterNextRender(() => {
      this.initializeEditor();
      this.attachEventListeners();
    });
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  /**
   * Initializes the editor with content and sets up event listeners.
   */
  private initializeEditor(): void {
    const content = this.sanitizeContent(this.initialContent());
    this.editorRef.nativeElement.innerHTML = content;
  }

  /**
   * Attaches event listeners for link detection and content changes.
   */
  private attachEventListeners(): void {
    const editor = this.editorRef.nativeElement;
    editor.addEventListener('mouseup', this.handleCaretInLink);
    editor.addEventListener('keyup', this.handleCaretInLink);
    editor.addEventListener('blur', this.handleContentChange);
    editor.addEventListener('paste', this.handlePaste);
  }

  /**
   * Removes event listeners during component destruction.
   */
  private removeEventListeners(): void {
    if (!this.editorRef?.nativeElement) return;

    const editor = this.editorRef.nativeElement;
    editor.removeEventListener('mouseup', this.handleCaretInLink);
    editor.removeEventListener('keyup', this.handleCaretInLink);
    editor.removeEventListener('blur', this.handleContentChange);
    editor.removeEventListener('paste', this.handlePaste);
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
   * Handles paste events to allow only plain text content.
   */
  private handlePaste = (event: ClipboardEvent): void => {
    event.preventDefault();

    // Get clipboard data
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    // Extract plain text only
    const plainText = clipboardData.getData('text/plain');
    if (!plainText) return;

    // Get current selection
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Delete any selected content
    range.deleteContents();

    // Insert plain text as text node
    const textNode = document.createTextNode(plainText);
    range.insertNode(textNode);

    // Move cursor to end of inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger content change event
    this.handleContentChange();
  };

  /**
   * Handles content changes in the editor and emits the updated content.
   */
  private handleContentChange = (): void => {
    const content = this.editorRef.nativeElement.innerHTML.trim();
    this.contentChange.emit(content);
  };

  /**
   * Finds the closest anchor element from a given node.
   */
  private findAnchorElement(node: Node): HTMLAnchorElement | null {
    let currentNode: Node | null =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : node;

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
      return this.bulletPointService.generateDefaultBulletList(
        this.bulletListConfig()
      );
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
    // Use the original user input instead of the resolved href
    const originalHref = link.getAttribute('data-original-href') || link.href;
    this.updateLinkState({
      linkInputValue: originalHref,
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
  private updateExistingLink(
    linkElement: HTMLAnchorElement,
    url: string
  ): void {
    linkElement.href = url.trim();
    // Store the original user input for display purposes
    linkElement.setAttribute('data-original-href', url.trim());
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
  private createAnchorElement(
    href: string,
    textContent: string
  ): HTMLAnchorElement {
    const anchor = document.createElement('a');
    anchor.href = href.trim();
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = textContent;
    // Store the original user input for display purposes
    anchor.setAttribute('data-original-href', href.trim());
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
      const input = document.getElementById(
        'link-input-box'
      ) as HTMLInputElement;
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
    const success = this.bulletPointService.handleEnterKey(
      this.editorRef.nativeElement,
      this.bulletListConfig()
    );

    if (!success) {
      // Fallback: insert a simple line break
      document.execCommand('insertLineBreak');
    }
  }

  /**
   * Bullet point tool event handlers
   */
  onToggleBulletList(): void {
    this.bulletPointService.toggleBulletList(
      this.editorRef.nativeElement,
      this.bulletListConfig()
    );
  }

  onCreateNewList(): void {
    const bulletConfig = this.bulletListConfig();
    this.editorRef.nativeElement.innerHTML =
      this.bulletPointService.generateDefaultBulletList(bulletConfig);
    this.bulletPointService.focusLastListItem(
      this.editorRef.nativeElement,
      bulletConfig
    );
  }

  onFixListStructure(): void {
    const bulletConfig = this.bulletListConfig();
    this.bulletPointService.fixListStructure(
      this.editorRef.nativeElement,
      bulletConfig
    );
    this.bulletPointService.focusLastListItem(
      this.editorRef.nativeElement,
      bulletConfig
    );
  }
}
