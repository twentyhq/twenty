import { isNonEmptyString } from '@sniptt/guards';
import { escapeText } from 'entities';

import { parseJson } from '@/utils/parseJson';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isVariableReference } from '@/utils/variable-resolver';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';

import { type EmailDocument } from './email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { HTML_ELEMENT_NAMES } from './html-element-names';
import { isEmailDocumentShape } from './is-email-document-shape';
import { parseEmailDocument } from './parse-email-document';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const ANGLE_BRACKET_TAG_PATTERN =
  /<(?<closingSlash>\/?)(?<tagName>[a-z][a-z0-9-]*)(?:\s[^<>]*)?(?<selfClosingSlash>\/?)>/gi;

const HTML_COMMENT_DOCTYPE_OR_ENTITY_PATTERN =
  /<!--|<!doctype\s|&(?:[a-z][a-z0-9]*|#\d+|#x[0-9a-f]+);/i;

const VARIABLE_TOKEN_PATTERN = /({{[^{}]+}})/;

const containsHtmlTag = (body: string): boolean =>
  Array.from(body.matchAll(ANGLE_BRACKET_TAG_PATTERN)).some((tagMatch) => {
    const tagName = tagMatch.groups?.tagName?.toLowerCase() ?? '';
    const isClosingTag = tagMatch.groups?.closingSlash === '/';
    const isSelfClosingTag = tagMatch.groups?.selfClosingSlash === '/';
    const isKnownHtmlElement = HTML_ELEMENT_NAMES.has(tagName);
    const isCustomElement = tagName.includes('-');

    return (
      isClosingTag || isSelfClosingTag || isKnownHtmlElement || isCustomElement
    );
  });

const looksLikeHtml = (body: string): boolean =>
  HTML_COMMENT_DOCTYPE_OR_ENTITY_PATTERN.test(body) || containsHtmlTag(body);

const normalizeLineBreaks = (text: string): string =>
  text.replace(/\r\n?/g, '\n');

const buildEmptyEmailDocument = (): EmailDocument => ({
  type: TIPTAP_NODE_TYPES.DOCUMENT,
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [],
});

const wrapInRawHtmlBlock = (html: string): EmailDocument => ({
  type: TIPTAP_NODE_TYPES.DOCUMENT,
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: TIPTAP_NODE_TYPES.HTML_DOCUMENT, attrs: { html } }],
});

const convertPlainTextWithVariablesToHtml = (plainText: string): string =>
  normalizeLineBreaks(plainText)
    .split(VARIABLE_TOKEN_PATTERN)
    .map((textOrVariable) =>
      isStandaloneVariableString(textOrVariable)
        ? textOrVariable
        : escapeText(textOrVariable),
    )
    .join('')
    .replace(/\n/g, '<br>');

const convertPlainTextToParagraph = (plainText: string): EmailDocument => {
  const lines = normalizeLineBreaks(plainText).split('\n');

  const paragraphContent = lines.flatMap((line, lineIndex) => {
    const lineBreakBeforeLine =
      lineIndex > 0 ? [{ type: TIPTAP_NODE_TYPES.HARD_BREAK }] : [];
    const lineText =
      line === '' ? [] : [{ type: TIPTAP_NODE_TYPES.TEXT, text: line }];

    return [...lineBreakBeforeLine, ...lineText];
  });

  return {
    type: TIPTAP_NODE_TYPES.DOCUMENT,
    attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
    content: [{ type: TIPTAP_NODE_TYPES.PARAGRAPH, content: paragraphContent }],
  };
};

const convertStringBodyToEmailDocument = (body: string): EmailDocument => {
  const trimmedBody = body.trim();

  if (!isNonEmptyString(trimmedBody)) {
    return buildEmptyEmailDocument();
  }

  const isSingleVariable = isStandaloneVariableString(trimmedBody);

  if (looksLikeHtml(body) || isSingleVariable) {
    return wrapInRawHtmlBlock(body);
  }

  const variableValuesMayContainHtml = isVariableReference(body);

  if (variableValuesMayContainHtml) {
    return wrapInRawHtmlBlock(convertPlainTextWithVariablesToHtml(body));
  }

  return convertPlainTextToParagraph(body);
};

export const convertEmailBodyToEmailDocument = (emailBody: unknown) => {
  const emailBodyAsJson =
    typeof emailBody === 'string' ? parseJson<unknown>(emailBody) : emailBody;

  if (typeof emailBody === 'string' && !isEmailDocumentShape(emailBodyAsJson)) {
    return {
      success: true as const,
      document: convertStringBodyToEmailDocument(emailBody),
    };
  }

  if (!isEmailDocumentShape(emailBodyAsJson)) {
    return parseEmailDocument(emailBodyAsJson);
  }

  const existingAttributes =
    'attrs' in emailBodyAsJson && isPlainObject(emailBodyAsJson.attrs)
      ? emailBodyAsJson.attrs
      : {};

  return parseEmailDocument({
    ...emailBodyAsJson,
    attrs: {
      ...existingAttributes,
      schemaVersion:
        existingAttributes.schemaVersion ?? EMAIL_DOCUMENT_SCHEMA_VERSION,
    },
  });
};
