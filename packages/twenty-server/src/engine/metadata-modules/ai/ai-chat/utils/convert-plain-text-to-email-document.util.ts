import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  type EmailDocument,
  TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';

// blank lines separate paragraphs and single line breaks stay inside one, as people write plain text
export const convertPlainTextToEmailDocument = (
  text: string,
): EmailDocument => ({
  type: TIPTAP_NODE_TYPES.DOCUMENT,
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => ({
      type: TIPTAP_NODE_TYPES.PARAGRAPH,
      content: paragraph
        .split('\n')
        .flatMap((line, lineIndex) => [
          ...(lineIndex > 0 ? [{ type: TIPTAP_NODE_TYPES.HARD_BREAK }] : []),
          ...(line.length > 0
            ? [{ type: TIPTAP_NODE_TYPES.TEXT, text: line }]
            : []),
        ]),
    })),
});
