export const TIPTAP_MARK_TYPES = {
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKE: 'strike',
  LINK: 'link',
} as const;

export type TipTapMarkType =
  (typeof TIPTAP_MARK_TYPES)[keyof typeof TIPTAP_MARK_TYPES];

export interface LinkMarkAttributes {
  href?: string;
  target?: string;
  rel?: string;
}

export interface TipTapMark {
  type: TipTapMarkType;
  attrs?: LinkMarkAttributes | Record<string, unknown>;
}
