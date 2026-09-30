import { type EmailDocument } from './email-document-schema';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

export const getEmailDocumentStandaloneHtml = (
  document: EmailDocument,
): string | undefined => {
  const [firstNode, ...otherNodes] = document.content ?? [];
  const html = firstNode?.attrs?.html;

  return firstNode?.type === TIPTAP_NODE_TYPES.HTML_DOCUMENT &&
    otherNodes.length === 0 &&
    typeof html === 'string'
    ? html
    : undefined;
};
