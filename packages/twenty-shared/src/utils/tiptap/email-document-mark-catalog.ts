import { type EmailDocumentStringContext } from './email-document-string-context';
import { TIPTAP_MARK_TYPES } from './tiptap-mark-types';

export const EMAIL_DOCUMENT_MARK_TYPES = {
  BOLD: TIPTAP_MARK_TYPES.BOLD,
  ITALIC: TIPTAP_MARK_TYPES.ITALIC,
  UNDERLINE: TIPTAP_MARK_TYPES.UNDERLINE,
  STRIKE: TIPTAP_MARK_TYPES.STRIKE,
  LINK: TIPTAP_MARK_TYPES.LINK,
} as const;

export type EmailDocumentMarkType =
  (typeof EMAIL_DOCUMENT_MARK_TYPES)[keyof typeof EMAIL_DOCUMENT_MARK_TYPES];

type EmailDocumentMarkDefinition = {
  stringAttributes: Readonly<
    Partial<Record<string, EmailDocumentStringContext>>
  >;
};

export const EMAIL_DOCUMENT_MARK_CATALOG = {
  [EMAIL_DOCUMENT_MARK_TYPES.BOLD]: { stringAttributes: {} },
  [EMAIL_DOCUMENT_MARK_TYPES.ITALIC]: { stringAttributes: {} },
  [EMAIL_DOCUMENT_MARK_TYPES.UNDERLINE]: { stringAttributes: {} },
  [EMAIL_DOCUMENT_MARK_TYPES.STRIKE]: { stringAttributes: {} },
  [EMAIL_DOCUMENT_MARK_TYPES.LINK]: {
    stringAttributes: { href: 'url' },
  },
} as const satisfies Record<EmailDocumentMarkType, EmailDocumentMarkDefinition>;

export const isEmailDocumentMarkType = (
  markType: string,
): markType is EmailDocumentMarkType =>
  Object.prototype.hasOwnProperty.call(EMAIL_DOCUMENT_MARK_CATALOG, markType);
