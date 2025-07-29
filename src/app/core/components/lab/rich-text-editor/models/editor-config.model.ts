export interface EditorToolbarConfig {
  /** Enable/disable the link feature */
  enableLinkTool?: boolean;
  /** Enable/disable the bold feature */
  enableBoldTool?: boolean;
  /** Enable/disable the italic feature */
  enableItalicTool?: boolean;
  /** Enable/disable the underline feature */
  enableUnderlineTool?: boolean;
  /** Enable/disable the bullet list feature */
  enableBulletListTool?: boolean;
  /** Enable/disable the numbered list feature */
  enableNumberedListTool?: boolean;
  /** Enable/disable the debug feature */
  enableDebugTool?: boolean;
}

export interface LinkToolConfig {
  /** Custom placeholder text for link input */
  linkPlaceholder?: string;
  /** Custom aria label for link button */
  linkAriaLabel?: string;
  /** Custom link button text */
  linkButtonText?: string;
}

export interface EditorConfig {
  /** Toolbar configuration */
  toolbar?: EditorToolbarConfig;
  /** Link tool specific configuration */
  linkTool?: LinkToolConfig;
  /** Initial content for the editor */
  initialContent?: string;
  /** Enable/disable spellcheck */
  spellcheck?: boolean;
  /** Custom aria label for editor */
  editorAriaLabel?: string;
}

export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
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
    linkPlaceholder: 'https://example.com',
    linkAriaLabel: 'Insert Link',
    linkButtonText: '🔗 Link',
  },
  spellcheck: true,
  editorAriaLabel: 'Rich Text Editor',
};
