import { type EmailDocumentStringContext } from './email-document-string-context';
import { TIPTAP_MARK_TYPES, type TipTapMarkType } from './tiptap-mark-types';

type EmailDocumentMarkDefinition = {
  stringAttributes: Readonly<
    Partial<Record<string, EmailDocumentStringContext>>
  >;
};

export const EMAIL_DOCUMENT_MARK_CATALOG = {
  [TIPTAP_MARK_TYPES.BOLD]: { stringAttributes: {} },
  [TIPTAP_MARK_TYPES.ITALIC]: { stringAttributes: {} },
  [TIPTAP_MARK_TYPES.UNDERLINE]: { stringAttributes: {} },
  [TIPTAP_MARK_TYPES.STRIKE]: { stringAttributes: {} },
  [TIPTAP_MARK_TYPES.LINK]: {
    stringAttributes: { href: 'url' },
  },
} as const satisfies Partial<
  Record<TipTapMarkType, EmailDocumentMarkDefinition>
>;

export type EmailDocumentMarkType = keyof typeof EMAIL_DOCUMENT_MARK_CATALOG;

export const isEmailDocumentMarkType = (
  markType: string,
): markType is EmailDocumentMarkType =>
  Object.prototype.hasOwnProperty.call(EMAIL_DOCUMENT_MARK_CATALOG, markType);
