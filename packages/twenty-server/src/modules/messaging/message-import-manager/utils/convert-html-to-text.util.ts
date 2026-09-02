import { convert, HtmlToTextOptions } from 'html-to-text';
import sanitizeHtml from 'sanitize-html';

import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';

const CONVERT_OPTIONS = {
  wordwrap: false,
  preserveNewlines: true,
} satisfies HtmlToTextOptions;

const TEXT_SHAPING_TAGS = [
  'a',
  'article',
  'aside',
  'b',
  'blockquote',
  'br',
  'caption',
  'center',
  'dd',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'font',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'i',
  'img',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  's',
  'section',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];

const NON_TEXT_TAGS = [
  'applet',
  'embed',
  'head',
  'iframe',
  'noscript',
  'object',
  'option',
  'script',
  'style',
  'template',
  'textarea',
  'title',
];

const QUOTE_CONTAINER_IDS = ['OLK_SRC_BODY_SECTION'];

const markQuoteContainersAsBlockquotes = (
  tagName: string,
  attribs: Record<string, string>,
): sanitizeHtml.Tag =>
  QUOTE_CONTAINER_IDS.includes(attribs.id)
    ? { tagName: 'blockquote', attribs: {} }
    : { tagName, attribs };

const SANITIZE_OPTIONS = {
  allowedTags: TEXT_SHAPING_TAGS,
  allowedAttributes: { a: ['href'], img: ['src', 'alt'], '*': ['title'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  disallowedTagsMode: 'discard',
  nonTextTags: NON_TEXT_TAGS,
  transformTags: { '*': markQuoteContainersAsBlockquotes },
} satisfies sanitizeHtml.IOptions;

export const convertHtmlToText = (html: string): string =>
  normalizeMessageText(
    convert(sanitizeHtml(html, SANITIZE_OPTIONS), CONVERT_OPTIONS),
  );
