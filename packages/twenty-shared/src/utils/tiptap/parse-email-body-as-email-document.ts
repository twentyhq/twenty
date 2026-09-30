import { parseJson } from '@/utils/parseJson';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';

import { convertPlainTextToEmailDocument } from './convert-plain-text-to-email-document';
import { type EmailDocument } from './email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { isEmailDocumentShape } from './is-email-document-shape';
import { parseEmailDocument } from './parse-email-document';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const HTML_MARKUP_PATTERN =
  /<\/?[a-z][a-z0-9-]*(?:\s[^<>]*)?\/?>|<!--|&(?:[a-z][a-z0-9]*|#\d+|#x[0-9a-f]+);/i;

const convertStringToEmailDocument = (body: string): EmailDocument => {
  if (body.trim() === '') {
    return {
      type: TIPTAP_NODE_TYPES.DOCUMENT,
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [],
    };
  }

  if (
    !HTML_MARKUP_PATTERN.test(body) &&
    !isStandaloneVariableString(body.trim())
  ) {
    return convertPlainTextToEmailDocument(body);
  }

  return {
    type: TIPTAP_NODE_TYPES.DOCUMENT,
    attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
    content: [{ type: TIPTAP_NODE_TYPES.HTML_DOCUMENT, attrs: { html: body } }],
  };
};

export const parseEmailBodyAsEmailDocument = (body: unknown) => {
  const value = typeof body === 'string' ? parseJson<unknown>(body) : body;

  if (typeof body === 'string' && !isEmailDocumentShape(value)) {
    return {
      success: true as const,
      document: convertStringToEmailDocument(body),
    };
  }

  if (!isEmailDocumentShape(value)) {
    return parseEmailDocument(value);
  }

  const { attrs } = value as EmailDocument;

  return parseEmailDocument({
    ...value,
    attrs: {
      ...attrs,
      schemaVersion: attrs?.schemaVersion ?? EMAIL_DOCUMENT_SCHEMA_VERSION,
    },
  });
};
