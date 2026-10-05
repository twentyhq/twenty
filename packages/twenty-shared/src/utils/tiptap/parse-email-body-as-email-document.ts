import { isNonEmptyString } from '@sniptt/guards';

import { parseJson } from '@/utils/parseJson';
import { escapeHtml } from '@/utils/strings/escapeHtml';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';

import { convertPlainTextToEmailDocument } from './convert-plain-text-to-email-document';
import { type EmailDocument } from './email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { HTML_ELEMENT_NAMES } from './html-element-names';
import { isEmailDocumentShape } from './is-email-document-shape';
import { parseEmailDocument } from './parse-email-document';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const HTML_TAG_PATTERN = /<(\/?)([a-z][a-z0-9-]*)(?:\s[^<>]*)?(\/?)>/gi;

const HTML_COMMENT_DOCTYPE_OR_ENTITY_PATTERN =
  /<!--|<!doctype\s|&(?:[a-z][a-z0-9]*|#\d+|#x[0-9a-f]+);/i;

const containsHtmlMarkup = (body: string): boolean => {
  if (HTML_COMMENT_DOCTYPE_OR_ENTITY_PATTERN.test(body)) {
    return true;
  }

  return Array.from(body.matchAll(HTML_TAG_PATTERN)).some(
    ([, closingSlash, tagName, selfClosingSlash]) =>
      closingSlash === '/' ||
      selfClosingSlash === '/' ||
      HTML_ELEMENT_NAMES.has(tagName?.toLowerCase() ?? '') ||
      (tagName?.includes('-') ?? false),
  );
};

const buildHtmlDocument = (html: string): EmailDocument => ({
  type: TIPTAP_NODE_TYPES.DOCUMENT,
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: TIPTAP_NODE_TYPES.HTML_DOCUMENT, attrs: { html } }],
});

const VARIABLE_TOKEN_PATTERN = /({{[^{}]+}})/;

const convertPlainTextToHtml = (text: string): string =>
  text
    .replace(/\r\n?/g, '\n')
    .split(VARIABLE_TOKEN_PATTERN)
    .map((part) => (isStandaloneVariableString(part) ? part : escapeHtml(part)))
    .join('')
    .replace(/\n/g, '<br>');

const convertStringToEmailDocument = (body: string): EmailDocument => {
  if (!isNonEmptyString(body.trim())) {
    return {
      type: TIPTAP_NODE_TYPES.DOCUMENT,
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [],
    };
  }

  if (containsHtmlMarkup(body) || isStandaloneVariableString(body.trim())) {
    return buildHtmlDocument(body);
  }

  if (VARIABLE_TOKEN_PATTERN.test(body)) {
    return buildHtmlDocument(convertPlainTextToHtml(body));
  }

  return convertPlainTextToEmailDocument(body);
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
