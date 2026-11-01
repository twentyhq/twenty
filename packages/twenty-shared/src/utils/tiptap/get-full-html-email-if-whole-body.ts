import { isString } from '@sniptt/guards';

import { type EmailDocument } from './email-document-schema';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

export const getFullHtmlEmailIfWholeBody = (
  emailDocument: EmailDocument,
): string | undefined => {
  const blocks = emailDocument.content ?? [];
  const [firstBlock] = blocks;
  const isOnlyBlock = blocks.length === 1;
  const isRawHtmlBlock = firstBlock?.type === TIPTAP_NODE_TYPES.HTML_DOCUMENT;
  const rawHtml = firstBlock?.attrs?.html;

  return isOnlyBlock && isRawHtmlBlock && isString(rawHtml)
    ? rawHtml
    : undefined;
};
