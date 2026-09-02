import { convert, HtmlToTextOptions } from 'html-to-text';
import sanitizeHtml from 'sanitize-html';

import { HTML_QUOTE_SELECTORS } from 'src/modules/messaging/message-import-manager/utils/html-quote-selectors.constant';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';

const QUOTE_MARKER = '\uE000';
const REPEATED_QUOTE_MARKER = '\uE001';
const ALL_QUOTE_MARKERS = /[\uE000\uE001]/g;

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

const TAGS_CARRYING_NO_BODY_TEXT = [
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

const SANITIZE_OPTIONS = {
  allowedTags: TEXT_SHAPING_TAGS,
  allowedAttributes: {
    a: ['href'],
    img: ['src', 'alt'],
    '*': ['title', 'class', 'id', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  disallowedTagsMode: 'discard',
  nonTextTags: TAGS_CARRYING_NO_BODY_TEXT,
} satisfies sanitizeHtml.IOptions;

const buildQuoteMarkerFormatter =
  (marker: string) =>
  (
    element: { children: unknown[] },
    walk: (children: unknown[], builder: unknown) => void,
    builder: { addInline: (text: string) => void },
  ): void => {
    builder.addInline(marker);
    walk(element.children, builder);
  };

const CONVERT_OPTIONS = {
  wordwrap: false,
  preserveNewlines: true,
  selectors: [
    ...HTML_QUOTE_SELECTORS.quoteContainers.map((selector) => ({
      selector,
      format: 'quoteMarker',
    })),
    ...HTML_QUOTE_SELECTORS.repeatedQuoteContainers.map((selector) => ({
      selector,
      format: 'repeatedQuoteMarker',
    })),
  ],
  formatters: {
    quoteMarker: buildQuoteMarkerFormatter(QUOTE_MARKER),
    repeatedQuoteMarker: buildQuoteMarkerFormatter(REPEATED_QUOTE_MARKER),
  },
} as HtmlToTextOptions;

const removeNonTextMarkup = (html: string): string =>
  sanitizeHtml(html, SANITIZE_OPTIONS);

const renderTextWithQuoteMarkers = (safeHtml: string): string =>
  convert(safeHtml, CONVERT_OPTIONS);

const findQuoteMarkerIndex = (text: string): number => {
  const firstQuote = text.indexOf(QUOTE_MARKER);
  const firstRepeated = text.indexOf(REPEATED_QUOTE_MARKER);
  const secondRepeated =
    firstRepeated === -1
      ? -1
      : text.indexOf(REPEATED_QUOTE_MARKER, firstRepeated + 1);

  const markerIndexes = [firstQuote, secondRepeated].filter(
    (index) => index !== -1,
  );

  return markerIndexes.length === 0 ? -1 : Math.min(...markerIndexes);
};

const cutAtQuoteMarker = (text: string): string => {
  const markerIndex = findQuoteMarkerIndex(text);
  const beforeMarker = markerIndex === -1 ? text : text.slice(0, markerIndex);

  return (beforeMarker.trim() === '' ? text : beforeMarker).replace(
    ALL_QUOTE_MARKERS,
    '',
  );
};

export const convertHtmlToText = (html: string): string =>
  normalizeMessageText(
    cutAtQuoteMarker(renderTextWithQuoteMarkers(removeNonTextMarkup(html))),
  );
