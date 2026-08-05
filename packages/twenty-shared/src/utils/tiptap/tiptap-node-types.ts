export const TIPTAP_NODE_TYPES = {
  DOCUMENT: 'doc',
  PARAGRAPH: 'paragraph',
  TEXT: 'text',
  HEADING: 'heading',
  VARIABLE_TAG: 'variableTag',
  IMAGE: 'image',
  BULLET_LIST: 'bulletList',
  ORDERED_LIST: 'orderedList',
  LIST_ITEM: 'listItem',
  HARD_BREAK: 'hardBreak',
  SECTION: 'section',
  COLUMNS: 'columns',
  COLUMN: 'column',
  BUTTON: 'button',
  DIVIDER: 'divider',
  HTML: 'html',
} as const;

export type TipTapNodeType =
  (typeof TIPTAP_NODE_TYPES)[keyof typeof TIPTAP_NODE_TYPES];
