import { isPlainObject } from '@/utils/typeguard/isPlainObject';

import { isTipTapNode } from './parse-tiptap-json-document';
import { type TipTapDocument } from './tiptap-document';
import { type TipTapNode } from './tiptap-node';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

// Workflow steps created through the API can still hold BlockNote, which also parses as TipTap
const BLOCKNOTE_ONLY_KEYS = ['id', 'props', 'children', 'styles'];

const isBlockNoteContent = (value: unknown): boolean => {
  if (!isPlainObject(value)) {
    return false;
  }

  if (BLOCKNOTE_ONLY_KEYS.some((key) => key in value)) {
    return true;
  }

  return Array.isArray(value.content) && value.content.some(isBlockNoteContent);
};

const isTipTapDocumentNode = (
  node: TipTapNode | undefined,
): node is TipTapDocument => node?.type === TIPTAP_NODE_TYPES.DOCUMENT;

export const convertTipTapBlocksToDocument = (
  serializedBlocks: string,
): TipTapDocument | undefined => {
  let parsedBlocks: unknown;

  try {
    parsedBlocks = JSON.parse(serializedBlocks);
  } catch {
    return undefined;
  }

  const nodes = Array.isArray(parsedBlocks) ? parsedBlocks : [parsedBlocks];

  if (
    nodes.length === 0 ||
    nodes.some(isBlockNoteContent) ||
    !nodes.every(isTipTapNode)
  ) {
    return undefined;
  }

  const [firstNode] = nodes;

  return nodes.length === 1 && isTipTapDocumentNode(firstNode)
    ? firstNode
    : { type: TIPTAP_NODE_TYPES.DOCUMENT, content: nodes };
};
