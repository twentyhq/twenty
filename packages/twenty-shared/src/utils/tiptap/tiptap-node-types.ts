export const TIPTAP_NODE_TYPES = {
  PARAGRAPH: 'paragraph',
  TEXT: 'text',
  HEADING: 'heading',
  VARIABLE_TAG: 'variableTag',
  IMAGE: 'image',
  BULLET_LIST: 'bulletList',
  ORDERED_LIST: 'orderedList',
  LIST_ITEM: 'listItem',
  HARD_BREAK: 'hardBreak',
  // Block nodes, authored on the editor canvas and rendered to email-safe
  // HTML server-side by twenty-emails. Their attributes carry a structured
  // style object of camelCase CSS properties.
  SECTION: 'section',
  COLUMNS: 'columns',
  COLUMN: 'column',
  BUTTON: 'button',
  DIVIDER: 'divider',
  HTML: 'html',
} as const;

export type TipTapNodeType =
  (typeof TIPTAP_NODE_TYPES)[keyof typeof TIPTAP_NODE_TYPES];
