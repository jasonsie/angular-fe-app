import { Injectable } from '@angular/core';
import { BulletListConfig } from '../models/editor-config.model';
import { BulletPointState } from '../components/bullet-point-tool/bullet-point-tool.component';

@Injectable({
  providedIn: 'root'
})
export class BulletPointService {

  /**
   * Generates the default bullet list HTML based on configuration.
   */
  generateDefaultBulletList(config: BulletListConfig): string {
    return `<${config.listTag} class="${config.listClass}"><li></li></${config.listTag}>`;
  }

  /**
   * Checks if the content is already formatted as a bullet list.
   */
  isAlreadyBulletList(content: string, config: BulletListConfig): boolean {
    const listPattern = new RegExp(`<${config.listTag}[^>]*class="[^"]*${config.listClass}[^"]*"`, 'i');
    return listPattern.test(content);
  }

  /**
   * Transforms plain text content into a bullet list format.
   */
  transformToBulletList(content: string, config: BulletListConfig): string {
    const lines = content.split(/\n|\r/).map(line => line.trim()).filter(Boolean);

    if (lines.length === 0) {
      return this.generateDefaultBulletList(config);
    }

    const listItems = lines.map(line => `<li>${line}</li>`).join('');
    return `<${config.listTag} class="${config.listClass}">${listItems}</${config.listTag}>`;
  }

  /**
   * Checks if the list has valid structure (all children are LI elements).
   */
  hasValidListStructure(ul: Element): boolean {
    return Array.from(ul.children).every(child => child.tagName === 'LI');
  }

  /**
   * Fixes the list structure by wrapping content in proper UL/LI elements.
   */
  fixListStructure(editor: HTMLElement, config: BulletListConfig): void {
    const text = editor.textContent || '';
    const items = text.split(/\n|\r/).map(t => t.trim()).filter(Boolean);
    const liHtml = items.length
      ? items.map(item => `<li>${item}</li>`).join('')
      : '<li></li>';

    editor.innerHTML = `<${config.listTag} class="${config.listClass}">${liHtml}</${config.listTag}>`;
  }

  /**
   * Inserts a new list item after the current one.
   */
  insertNewListItem(): boolean {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return false;

    const currentLi = this.findCurrentListItem(selection.getRangeAt(0));
    if (currentLi?.parentNode) {
      const newLi = document.createElement('li');
      currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
      this.focusElement(newLi);
      return true;
    }
    return false;
  }

  /**
   * Finds the current list item from the selection range.
   */
  findCurrentListItem(range: Range): HTMLElement | null {
    let node: Node | null = range.startContainer;

    while (node && (node.nodeType !== 1 || (node as HTMLElement).tagName !== 'LI')) {
      node = node.parentNode;
    }

    return node as HTMLElement | null;
  }

  /**
   * Focuses the last list item in the editor.
   */
  focusLastListItem(editor: HTMLElement, config: BulletListConfig): void {
    const lastLi = editor.querySelector(`${config.listTag}.${config.listClass} li:last-child`);
    if (lastLi) {
      this.focusElement(lastLi as HTMLElement);
    }
  }

  /**
   * Focuses an element by placing the caret at the end of its content.
   */
  focusElement(element: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  /**
   * Analyzes the current editor state and returns bullet point state.
   */
  analyzeBulletPointState(editor: HTMLElement, config: BulletListConfig): BulletPointState {
    const list = editor.querySelector(`${config.listTag}.${config.listClass}`);

    if (!list) {
      return {
        isActive: false,
        currentListType: null,
        listItemCount: 0
      };
    }

    const listItems = list.querySelectorAll('li');

    return {
      isActive: true,
      currentListType: config.listTag || 'ul',
      listItemCount: listItems.length
    };
  }

  /**
   * Toggles bullet list formatting for selected content or current list.
   */
  toggleBulletList(editor: HTMLElement, config: BulletListConfig): boolean {
    const state = this.analyzeBulletPointState(editor, config);

    if (state.isActive) {
      return this.removeBulletListFormatting(editor, config);
    } else {
      return this.applyBulletListFormatting(editor, config);
    }
  }

  /**
   * Applies bullet list formatting to selected content or creates a new list.
   */
  private applyBulletListFormatting(editor: HTMLElement, config: BulletListConfig): boolean {
    const selection = window.getSelection();

    if (!selection?.rangeCount) {
      // No selection, create a new list
      editor.innerHTML = this.generateDefaultBulletList(config);
      this.focusLastListItem(editor, config);
      return true;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (!selectedText) {
      // Empty selection, create a new list
      const newListHtml = this.generateDefaultBulletList(config);
      range.deleteContents();
      range.insertNode(this.createElementFromHTML(newListHtml));
      return true;
    }

    // Transform selected text to bullet list
    const bulletListHtml = this.transformToBulletList(selectedText, config);
    range.deleteContents();
    range.insertNode(this.createElementFromHTML(bulletListHtml));

    return true;
  }

  /**
   * Removes bullet list formatting, converting back to plain text.
   */
  private removeBulletListFormatting(editor: HTMLElement, config: BulletListConfig): boolean {
    const list = editor.querySelector(`${config.listTag}.${config.listClass}`);

    if (!list) return false;

    const listItems = Array.from(list.querySelectorAll('li'));
    const plainText = listItems
      .map(li => li.textContent?.trim() || '')
      .filter(text => text.length > 0)
      .join('\n');

    if (list.parentNode) {
      const textNode = document.createTextNode(plainText || '');
      list.parentNode.replaceChild(textNode, list);
      return true;
    }

    return false;
  }

  /**
   * Creates an HTML element from HTML string.
   */
  private createElementFromHTML(htmlString: string): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild as HTMLElement;
  }

  /**
   * Handles Enter key press for bullet lists.
   */
  handleEnterKey(editor: HTMLElement, config: BulletListConfig): boolean {
    const list = editor.querySelector(`${config.listTag}.${config.listClass}`);
    const hasValidStructure = list && this.hasValidListStructure(list);

    if (!hasValidStructure) {
      this.fixListStructure(editor, config);
      this.focusLastListItem(editor, config);
      return true;
    }

    return this.insertNewListItem();
  }
}
