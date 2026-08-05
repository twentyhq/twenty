import { type EmailDocumentStringContext } from './email-document-string-context';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

export const EMAIL_DOCUMENT_NODE_TYPES = {
  DOCUMENT: 'doc',
  PARAGRAPH: TIPTAP_NODE_TYPES.PARAGRAPH,
  TEXT: TIPTAP_NODE_TYPES.TEXT,
  HEADING: TIPTAP_NODE_TYPES.HEADING,
  VARIABLE_TAG: TIPTAP_NODE_TYPES.VARIABLE_TAG,
  IMAGE: TIPTAP_NODE_TYPES.IMAGE,
  BULLET_LIST: TIPTAP_NODE_TYPES.BULLET_LIST,
  ORDERED_LIST: TIPTAP_NODE_TYPES.ORDERED_LIST,
  LIST_ITEM: TIPTAP_NODE_TYPES.LIST_ITEM,
  HARD_BREAK: TIPTAP_NODE_TYPES.HARD_BREAK,
  SECTION: TIPTAP_NODE_TYPES.SECTION,
  COLUMNS: TIPTAP_NODE_TYPES.COLUMNS,
  COLUMN: TIPTAP_NODE_TYPES.COLUMN,
  BUTTON: TIPTAP_NODE_TYPES.BUTTON,
  DIVIDER: TIPTAP_NODE_TYPES.DIVIDER,
  HTML: TIPTAP_NODE_TYPES.HTML,
} as const;

export type EmailDocumentNodeType =
  (typeof EMAIL_DOCUMENT_NODE_TYPES)[keyof typeof EMAIL_DOCUMENT_NODE_TYPES];

type EmailDocumentNodeDefinition = {
  kind: 'document' | 'block' | 'inline' | 'structural';
  renderMode: 'children' | 'node' | 'parent';
  stringAttributes: Readonly<
    Partial<Record<string, EmailDocumentStringContext>>
  >;
};

export const EMAIL_DOCUMENT_NODE_CATALOG = {
  [EMAIL_DOCUMENT_NODE_TYPES.DOCUMENT]: {
    kind: 'document',
    renderMode: 'children',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.PARAGRAPH]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.TEXT]: {
    kind: 'inline',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.HEADING]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.VARIABLE_TAG]: {
    kind: 'inline',
    renderMode: 'node',
    stringAttributes: { variable: 'text' },
  },
  [EMAIL_DOCUMENT_NODE_TYPES.IMAGE]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {
      src: 'url',
      href: 'url',
      alt: 'text',
      title: 'text',
    },
  },
  [EMAIL_DOCUMENT_NODE_TYPES.BULLET_LIST]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.ORDERED_LIST]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.LIST_ITEM]: {
    kind: 'structural',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.HARD_BREAK]: {
    kind: 'inline',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.SECTION]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.COLUMNS]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.COLUMN]: {
    kind: 'structural',
    renderMode: 'parent',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.BUTTON]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: { href: 'url' },
  },
  [EMAIL_DOCUMENT_NODE_TYPES.DIVIDER]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [EMAIL_DOCUMENT_NODE_TYPES.HTML]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: { html: 'html' },
  },
} as const satisfies Record<EmailDocumentNodeType, EmailDocumentNodeDefinition>;

export type RenderedEmailDocumentNodeType = {
  [TNodeType in EmailDocumentNodeType]: (typeof EMAIL_DOCUMENT_NODE_CATALOG)[TNodeType]['renderMode'] extends 'node'
    ? TNodeType
    : never;
}[EmailDocumentNodeType];

export const isEmailDocumentNodeType = (
  nodeType: string,
): nodeType is EmailDocumentNodeType =>
  Object.prototype.hasOwnProperty.call(EMAIL_DOCUMENT_NODE_CATALOG, nodeType);

export const isRenderedEmailDocumentNodeType = (
  nodeType: string,
): nodeType is RenderedEmailDocumentNodeType =>
  isEmailDocumentNodeType(nodeType) &&
  EMAIL_DOCUMENT_NODE_CATALOG[nodeType].renderMode === 'node';
