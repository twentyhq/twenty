import { convert, HtmlToTextOptions } from 'html-to-text';
import sanitizeHtml from 'sanitize-html';

import { HTML_QUOTE_SELECTORS } from 'src/modules/messaging/message-import-manager/utils/html-quote-selectors.constant';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';

const QUOTE_OPEN = '\uE000';
const QUOTE_CLOSE = '\uE001';
const SPLITTER = '\uE002';
const REPEATED_SPLITTER = '\uE003';
const ALL_MARKERS = /[\uE000\uE001\uE002\uE003]/g;
const QUOTED_CONTAINER = /\uE000[\s\S]*?\uE001/g;

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

const wrapQuoteContainer = (
  element: { children: unknown[] },
  walk: (children: unknown[], builder: unknown) => void,
  builder: { addInline: (text: string) => void },
): void => {
  builder.addInline(QUOTE_OPEN);
  walk(element.children, builder);
  builder.addInline(QUOTE_CLOSE);
};

const buildSplitterFormatter =
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
      format: 'quoteContainer',
    })),
    ...HTML_QUOTE_SELECTORS.quoteSplitters.map((selector) => ({
      selector,
      format: 'quoteSplitter',
    })),
    ...HTML_QUOTE_SELECTORS.repeatedQuoteSplitters.map((selector) => ({
      selector,
      format: 'repeatedQuoteSplitter',
    })),
  ],
  formatters: {
    quoteContainer: wrapQuoteContainer,
    quoteSplitter: buildSplitterFormatter(SPLITTER),
    repeatedQuoteSplitter: buildSplitterFormatter(REPEATED_SPLITTER),
  },
} as HtmlToTextOptions;

const removeNonTextMarkup = (html: string): string =>
  sanitizeHtml(html, SANITIZE_OPTIONS);

const renderTextWithQuoteMarkers = (safeHtml: string): string =>
  convert(safeHtml, CONVERT_OPTIONS);

const removeQuoteContainers = (text: string): string => {
  const withoutContainers = text.replace(QUOTED_CONTAINER, '');

  return withoutContainers.replace(ALL_MARKERS, '').trim() === ''
    ? text
    : withoutContainers;
};

const findSplitterIndex = (text: string): number => {
  const firstSplitter = text.indexOf(SPLITTER);
  const firstRepeated = text.indexOf(REPEATED_SPLITTER);
  const secondRepeated =
    firstRepeated === -1
      ? -1
      : text.indexOf(REPEATED_SPLITTER, firstRepeated + 1);

  const splitterIndexes = [firstSplitter, secondRepeated].filter(
    (index) => index !== -1,
  );

  return splitterIndexes.length === 0 ? -1 : Math.min(...splitterIndexes);
};

const cutAtSplitter = (text: string): string => {
  const splitterIndex = findSplitterIndex(text);
  const beforeSplitter =
    splitterIndex === -1 ? text : text.slice(0, splitterIndex);

  return beforeSplitter.replace(ALL_MARKERS, '').trim() === ''
    ? text
    : beforeSplitter;
};

const removeQuotedMarkup = (text: string): string =>
  cutAtSplitter(removeQuoteContainers(text)).replace(ALL_MARKERS, '');

export const convertHtmlToText = (html: string): string =>
  normalizeMessageText(
    removeQuotedMarkup(renderTextWithQuoteMarkers(removeNonTextMarkup(html))),
  );
