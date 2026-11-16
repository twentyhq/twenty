import { convertTextToTipTapNodes } from './convert-text-to-tiptap-nodes';
import { type EmailBodyInput } from './email-body-input-schema';
import { type EmailDocument } from './email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const buildEmailDocument = (
  content: EmailDocument['content'],
): EmailDocument => ({
  type: TIPTAP_NODE_TYPES.DOCUMENT,
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content,
});

export const convertEmailBodyInputToEmailDocument = (
  body: EmailBodyInput,
): EmailDocument => {
  switch (body.type) {
    case 'html':
      return buildEmailDocument([
        { type: TIPTAP_NODE_TYPES.HTML_DOCUMENT, attrs: { html: body.html } },
      ]);
    case 'text':
      return buildEmailDocument([
        {
          type: TIPTAP_NODE_TYPES.PARAGRAPH,
          content: convertTextToTipTapNodes(body.text, []),
        },
      ]);
    case TIPTAP_NODE_TYPES.DOCUMENT:
      return {
        ...body,
        attrs: {
          ...body.attrs,
          schemaVersion:
            body.attrs?.schemaVersion ?? EMAIL_DOCUMENT_SCHEMA_VERSION,
        },
      };
  }
};
