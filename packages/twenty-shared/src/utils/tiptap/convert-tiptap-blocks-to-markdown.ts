import { isDefined } from '@/utils/validation';

import { convertTipTapBlocksToDocument } from './convert-tiptap-blocks-to-document';
import { tipTapDocumentToMarkdown } from './tiptap-document-to-markdown';

export const convertTipTapBlocksToMarkdown = (
  serializedBlocks: string,
): string | undefined => {
  const document = convertTipTapBlocksToDocument(serializedBlocks);

  return isDefined(document) ? tipTapDocumentToMarkdown(document) : undefined;
};
