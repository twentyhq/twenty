import { type EmailDocumentStringContext } from './email-document-string-context';
import { TIPTAP_NODE_TYPES, type TipTapNodeType } from './tiptap-node-types';

type EmailDocumentNodeDefinition = {
  renderMode: 'children' | 'node' | 'parent';
  stringAttributes: Readonly<
    Partial<Record<string, EmailDocumentStringContext>>
  >;
};

export const EMAIL_DOCUMENT_NODE_CATALOG = {
  [TIPTAP_NODE_TYPES.DOCUMENT]: {
    renderMode: 'children',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.PARAGRAPH]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.TEXT]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.HEADING]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.VARIABLE_TAG]: {
    renderMode: 'node',
    stringAttributes: { variable: 'text' },
  },
  [TIPTAP_NODE_TYPES.IMAGE]: {
    renderMode: 'node',
    stringAttributes: {
      src: 'url',
      href: 'url',
      alt: 'text',
      title: 'text',
    },
  },
  [TIPTAP_NODE_TYPES.BULLET_LIST]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.ORDERED_LIST]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.LIST_ITEM]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.HARD_BREAK]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.SECTION]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.COLUMNS]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.COLUMN]: {
    renderMode: 'parent',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.BUTTON]: {
    renderMode: 'node',
    stringAttributes: { href: 'url' },
  },
  [TIPTAP_NODE_TYPES.DIVIDER]: {
    renderMode: 'node',
    stringAttributes: {},
  },
  [TIPTAP_NODE_TYPES.HTML]: {
    renderMode: 'node',
    stringAttributes: { html: 'html' },
  },
} as const satisfies Partial<
  Record<TipTapNodeType, EmailDocumentNodeDefinition>
>;

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
