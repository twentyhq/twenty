import { isDefined } from '@/utils/validation';

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
  TIPTAP_NODE_TYPES.TASK_LIST,
  TIPTAP_NODE_TYPES.TASK_ITEM,
  TIPTAP_NODE_TYPES.SECTION,
  TIPTAP_NODE_TYPES.COLUMNS,
  TIPTAP_NODE_TYPES.COLUMN,
  TIPTAP_NODE_TYPES.BUTTON,
  TIPTAP_NODE_TYPES.DIVIDER,
  TIPTAP_NODE_TYPES.HTML,
  TIPTAP_NODE_TYPES.HARD_BREAK,
  TIPTAP_NODE_TYPES.VARIABLE_TAG,
  TIPTAP_NODE_TYPES.MENTION_TAG,
  TIPTAP_NODE_TYPES.SKILL_TAG,
];

// BlockNote keeps formatting in `props` and `styles`, so `attrs` and `marks`
// only ever come from TipTap, even in a body made of plain paragraphs.
// Temporary until rich text is stored as TipTap: twentyhq/core-team-issues#2921
const containsTipTapOnlyContent = (node: TipTapNode): boolean =>
  TIPTAP_ONLY_NODE_TYPES.includes(node.type) ||
  isDefined(node.attrs) ||
  isDefined(node.marks) ||
  (node.content ?? []).some(containsTipTapOnlyContent);

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

  if (!nodes.every(isTipTapNode) || !nodes.some(containsTipTapOnlyContent)) {
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
