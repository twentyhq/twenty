import { type TipTapDocument } from './tiptap-document';
import { isTipTapNode } from './parse-tiptap-json-document';
import { tipTapDocumentToMarkdown } from './tiptap-document-to-markdown';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

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

  if (nodes.length === 0 || !nodes.every(isTipTapNode)) {
    return undefined;
  }

  const [firstNode] = nodes;

  if (nodes.length === 1 && firstNode.type === TIPTAP_NODE_TYPES.DOCUMENT) {
    return tipTapDocumentToMarkdown(firstNode as TipTapDocument);
  }

  return tipTapDocumentToMarkdown({
    type: TIPTAP_NODE_TYPES.DOCUMENT,
    content: nodes,
  });
};
