import { isTipTapNode } from './parse-tiptap-json-document';
import { type TipTapDocument } from './tiptap-document';
import { tipTapDocumentToMarkdown } from './tiptap-document-to-markdown';
import { type TipTapNode } from './tiptap-node';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const TIPTAP_ONLY_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.DOCUMENT,
  TIPTAP_NODE_TYPES.BULLET_LIST,
  TIPTAP_NODE_TYPES.ORDERED_LIST,
  TIPTAP_NODE_TYPES.LIST_ITEM,
  TIPTAP_NODE_TYPES.SECTION,
  TIPTAP_NODE_TYPES.COLUMNS,
  TIPTAP_NODE_TYPES.COLUMN,
  TIPTAP_NODE_TYPES.BUTTON,
  TIPTAP_NODE_TYPES.DIVIDER,
  TIPTAP_NODE_TYPES.HTML,
];

const containsTipTapOnlyNode = (node: TipTapNode): boolean =>
  TIPTAP_ONLY_NODE_TYPES.includes(node.type) ||
  (node.content ?? []).some(containsTipTapOnlyNode);

export const convertTipTapBlocksToMarkdown = (
  serializedBlocks: string,
): string | undefined => {
  let parsedBlocks: unknown;

  try {
    parsedBlocks = JSON.parse(serializedBlocks);
  } catch {
    return undefined;
  }

  const nodes = Array.isArray(parsedBlocks) ? parsedBlocks : [parsedBlocks];

  if (!nodes.every(isTipTapNode) || !nodes.some(containsTipTapOnlyNode)) {
    return undefined;
  }

  const [firstNode] = nodes;

  return nodes.length === 1 && firstNode.type === TIPTAP_NODE_TYPES.DOCUMENT
    ? tipTapDocumentToMarkdown(firstNode as TipTapDocument)
    : tipTapDocumentToMarkdown({
        type: TIPTAP_NODE_TYPES.DOCUMENT,
        content: nodes,
      });
};
