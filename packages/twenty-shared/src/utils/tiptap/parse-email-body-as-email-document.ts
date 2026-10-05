import { parseJson } from '@/utils/parseJson';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';

import { convertPlainTextToEmailDocument } from './convert-plain-text-to-email-document';
import { type EmailDocument } from './email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { HTML_ELEMENT_NAMES } from './html-element-names';
import { isEmailDocumentShape } from './is-email-document-shape';
import { parseEmailDocument } from './parse-email-document';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const HTML_TAG_PATTERN = /<\/?([a-z][a-z0-9-]*)(?:\s[^<>]*)?(\/?)>/gi;

const HTML_COMMENT_DOCTYPE_OR_ENTITY_PATTERN =
  /<!--|<!doctype\s|&(?:[a-z][a-z0-9]*|#\d+|#x[0-9a-f]+);/i;

const isMarkupTag = ({
  body,
  tagName,
  isSelfClosing,
}: {
  body: string;
  tagName: string;
  isSelfClosing: boolean;
}): boolean =>
  HTML_ELEMENT_NAMES.has(tagName) ||
  tagName.includes('-') ||
  isSelfClosing ||
  body.toLowerCase().includes(`</${tagName}>`);

const containsHtmlMarkup = (body: string): boolean =>
  HTML_COMMENT_DOCTYPE_OR_ENTITY_PATTERN.test(body) ||
  Array.from(body.matchAll(HTML_TAG_PATTERN)).some(
    ([, tagName, selfClosingSlash]) =>
      isMarkupTag({
        body,
        tagName: tagName?.toLowerCase() ?? '',
        isSelfClosing: selfClosingSlash === '/',
      }),
  );

const convertStringToEmailDocument = (body: string): EmailDocument => {
  if (body.trim() === '') {
    return {
      type: TIPTAP_NODE_TYPES.DOCUMENT,
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [],
    };
  }

  if (!containsHtmlMarkup(body) && !isStandaloneVariableString(body.trim())) {
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

  const attrs =
    'attrs' in value && isPlainObject(value.attrs) ? value.attrs : {};

  return parseEmailDocument({
    ...value,
    attrs: {
      ...attrs,
      schemaVersion: attrs.schemaVersion ?? EMAIL_DOCUMENT_SCHEMA_VERSION,
    },
  });
};
