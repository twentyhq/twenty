import { isTipTapNode } from './parse-tiptap-json-document';
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

export const isTipTapBlocksShape = (serializedBlocks: string): boolean => {
  let parsedBlocks: unknown;

  try {
    parsedBlocks = JSON.parse(serializedBlocks);
  } catch {
    return false;
  }

  const nodes = Array.isArray(parsedBlocks) ? parsedBlocks : [parsedBlocks];

  if (nodes.length === 0 || !nodes.every(isTipTapNode)) {
    return false;
  }

  return nodes.some(containsTipTapOnlyNode);
};
