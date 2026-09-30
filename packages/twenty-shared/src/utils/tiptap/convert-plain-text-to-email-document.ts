import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';

import { type EmailDocumentNode } from './email-document-node';
import { type EmailDocument } from './email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const VARIABLE_TOKEN_PATTERN = /({{[^{}]+}})/;

const convertLineToInlineNodes = (line: string): EmailDocumentNode[] =>
  line
    .split(VARIABLE_TOKEN_PATTERN)
    .filter((part) => part !== '')
    .map((part) =>
      isStandaloneVariableString(part)
        ? { type: TIPTAP_NODE_TYPES.VARIABLE_TAG, attrs: { variable: part } }
        : { type: TIPTAP_NODE_TYPES.TEXT, text: part },
    );

export const convertPlainTextToEmailDocument = (
  text: string,
): EmailDocument => ({
  type: TIPTAP_NODE_TYPES.DOCUMENT,
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [
    {
      type: TIPTAP_NODE_TYPES.PARAGRAPH,
      content: text
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .flatMap((line, index) => [
          ...(index > 0 ? [{ type: TIPTAP_NODE_TYPES.HARD_BREAK }] : []),
          ...convertLineToInlineNodes(line),
        ]),
    },
  ],
});
