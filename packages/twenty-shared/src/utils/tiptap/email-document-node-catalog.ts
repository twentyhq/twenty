import { type EmailDocumentStringContext } from './email-document-string-context';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

type EmailDocumentNodeDefinition = {
  kind: 'document' | 'block' | 'inline' | 'structural';
  renderMode: 'children' | 'node' | 'parent';
  stringAttributes: Readonly<
    Partial<Record<string, EmailDocumentStringContext>>
  >;
};

export const EMAIL_DOCUMENT_NODE_CATALOG = {
  [TIPTAP_NODE_TYPES.DOCUMENT]: {
    kind: 'document',
    renderMode: 'children',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.PARAGRAPH]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.TEXT]: {
    kind: 'inline',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.HEADING]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.VARIABLE_TAG]: {
    kind: 'inline',
    renderMode: 'node',
    stringAttributes: { variable: 'text' },
  },
  [TIPTAP_NODE_TYPES.IMAGE]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {
      src: 'url',
      href: 'url',
      alt: 'text',
      title: 'text',
    },
  },
  [TIPTAP_NODE_TYPES.BULLET_LIST]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.ORDERED_LIST]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.LIST_ITEM]: {
    kind: 'structural',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.HARD_BREAK]: {
    kind: 'inline',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.SECTION]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.COLUMNS]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.COLUMN]: {
    kind: 'structural',
    renderMode: 'parent',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.BUTTON]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: { href: 'url' },
  },
  [TIPTAP_NODE_TYPES.DIVIDER]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.HTML]: {
    kind: 'block',
    renderMode: 'node',
    stringAttributes: { html: 'html' },
  },
} as const satisfies Record<string, EmailDocumentNodeDefinition>;

export type EmailDocumentNodeType = keyof typeof EMAIL_DOCUMENT_NODE_CATALOG;

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
