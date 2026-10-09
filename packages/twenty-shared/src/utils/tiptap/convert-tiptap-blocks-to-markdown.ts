import { isTipTapNode } from './parse-tiptap-json-document';
import { type TipTapDocument } from './tiptap-document';
import { tipTapDocumentToMarkdown } from './tiptap-document-to-markdown';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const isBlockNoteBlock = (value: unknown): boolean =>
  typeof value === 'object' &&
  value !== null &&
  ('id' in value || 'props' in value);

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

  if (
    nodes.length === 0 ||
    nodes.some(isBlockNoteBlock) ||
    !nodes.every(isTipTapNode)
  ) {
    return undefined;
  }

  const [firstNode] = nodes;

  return nodes.length === 1 && firstNode?.type === TIPTAP_NODE_TYPES.DOCUMENT
    ? tipTapDocumentToMarkdown(firstNode as TipTapDocument)
    : tipTapDocumentToMarkdown({
        type: TIPTAP_NODE_TYPES.DOCUMENT,
        content: nodes,
      });
};
