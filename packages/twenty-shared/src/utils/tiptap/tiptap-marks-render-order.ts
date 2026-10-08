import { TIPTAP_MARK_TYPES, type TipTapMarkType } from './tiptap-mark-types';

export const TIPTAP_MARKS_RENDER_ORDER: readonly TipTapMarkType[] = [
  TIPTAP_MARK_TYPES.UNDERLINE,
  TIPTAP_MARK_TYPES.BOLD,
  TIPTAP_MARK_TYPES.ITALIC,
  TIPTAP_MARK_TYPES.STRIKE,
  TIPTAP_MARK_TYPES.LINK,
] as const;
