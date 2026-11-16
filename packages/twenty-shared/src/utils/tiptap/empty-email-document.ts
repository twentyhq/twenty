import { type EmailDocument } from './email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

export const EMPTY_EMAIL_DOCUMENT: EmailDocument = {
  type: TIPTAP_NODE_TYPES.DOCUMENT,
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: TIPTAP_NODE_TYPES.PARAGRAPH }],
};
