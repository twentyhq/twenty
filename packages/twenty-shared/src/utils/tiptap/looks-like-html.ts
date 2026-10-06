import { HTML_ELEMENT_NAMES } from './html-element-names';

const ANGLE_BRACKET_TAG_PATTERN =
  /<(?<closingSlash>\/?)(?<tagName>[a-z][a-z0-9-]*)(?:\s[^<>]*)?(?<selfClosingSlash>\/?)>/gi;

const HTML_COMMENT_DOCTYPE_OR_ENTITY_PATTERN =
  /<!--|<!doctype\s|&(?:[a-z][a-z0-9]*|#\d+|#x[0-9a-f]+);/i;

export const looksLikeHtml = (text: string): boolean =>
  HTML_COMMENT_DOCTYPE_OR_ENTITY_PATTERN.test(text) ||
  Array.from(text.matchAll(ANGLE_BRACKET_TAG_PATTERN)).some((tagMatch) => {
    const tagName = tagMatch.groups?.tagName?.toLowerCase() ?? '';
    const isClosingTag = tagMatch.groups?.closingSlash === '/';
    const isSelfClosingTag = tagMatch.groups?.selfClosingSlash === '/';
    const isKnownHtmlElement = HTML_ELEMENT_NAMES.has(tagName);
    const isCustomElement = tagName.includes('-');

    return (
      isClosingTag || isSelfClosingTag || isKnownHtmlElement || isCustomElement
    );
  });
