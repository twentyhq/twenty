// Shared TipTap types for consistency between frontend and email renderer

export const TIPTAP_MARK_TYPES = {
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKE: 'strike',
  LINK: 'link',
} as const;

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
} as const;

export type TipTapMarkType =
  (typeof TIPTAP_MARK_TYPES)[keyof typeof TIPTAP_MARK_TYPES];
export type TipTapNodeType =
  (typeof TIPTAP_NODE_TYPES)[keyof typeof TIPTAP_NODE_TYPES];

// Order for mark rendering (inner to outer)
export const TIPTAP_MARKS_RENDER_ORDER: readonly TipTapMarkType[] = [
  TIPTAP_MARK_TYPES.UNDERLINE,
  TIPTAP_MARK_TYPES.BOLD,
  TIPTAP_MARK_TYPES.ITALIC,
  TIPTAP_MARK_TYPES.STRIKE,
  TIPTAP_MARK_TYPES.LINK,
] as const;

// Link mark attributes interface
export interface LinkMarkAttributes {
  href?: string;
  target?: string;
  rel?: string;
}

// Generic mark interface
export interface TipTapMark {
  type: TipTapMarkType;
  attrs?: LinkMarkAttributes | Record<string, unknown>;
}
