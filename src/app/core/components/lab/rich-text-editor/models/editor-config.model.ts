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

export interface BulletListConfig {
  /** CSS class for the bullet list */
  listClass?: string;
  /** HTML element tag for the list container */
  listTag?: 'ul' | 'ol';
  /** If true, input text will be automatically transformed into bullet points */
  autoTransformToBulletList?: boolean;
  /** If true, the bullet list tool in toolbar will be disabled */
  disableBulletListTool?: boolean;
}

export interface EditorConfig {
  /** Toolbar configuration */
  toolbar?: EditorToolbarConfig;
  /** Link tool specific configuration */
  linkTool?: LinkToolConfig;
  /** Bullet list specific configuration */
  bulletList?: BulletListConfig;
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
  bulletList: {
    listClass: 'list-disc',
    listTag: 'ul',
    autoTransformToBulletList: false,
    disableBulletListTool: false,
  },
  spellcheck: true,
  editorAriaLabel: 'Rich Text Editor',
};
