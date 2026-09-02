import { convert, HtmlToTextOptions } from 'html-to-text';
import sanitizeHtml from 'sanitize-html';

import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';

const QUOTE_MARKER = '\uE000';
const REPEATED_QUOTE_MARKER = '\uE001';
const ALL_QUOTE_MARKERS = /[\uE000\uE001]/g;

const QUOTE_SELECTORS = [
  'div.gmail_quote',
  'div#divRplyFwdMsg',
  'div#OLK_SRC_BODY_SECTION',
];

const REPEATED_QUOTE_SELECTORS = [
  "div[style='border:none;border-top:solid #B5C4DF 1.0pt;padding:3.0pt 0cm 0cm 0cm']",
  "div[style='border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm']",
  "div[style='padding-top: 5px; border-top-color: rgb(229, 229, 229); border-top-width: 1px; border-top-style: solid;']",
];

const buildMarkerFormatter =
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
    ...QUOTE_SELECTORS.map((selector) => ({ selector, format: 'quoteMarker' })),
    ...REPEATED_QUOTE_SELECTORS.map((selector) => ({
      selector,
      format: 'repeatedQuoteMarker',
    })),
  ],
  formatters: {
    quoteMarker: buildMarkerFormatter(QUOTE_MARKER),
    repeatedQuoteMarker: buildMarkerFormatter(REPEATED_QUOTE_MARKER),
  },
} as HtmlToTextOptions;

const findQuoteSplitterIndex = (text: string): number => {
  const firstQuote = text.indexOf(QUOTE_MARKER);
  const firstRepeated = text.indexOf(REPEATED_QUOTE_MARKER);
  const secondRepeated =
    firstRepeated === -1
      ? -1
      : text.indexOf(REPEATED_QUOTE_MARKER, firstRepeated + 1);

  const candidates = [firstQuote, secondRepeated].filter(
    (index) => index !== -1,
  );

  return candidates.length === 0 ? -1 : Math.min(...candidates);
};

const cutAtQuoteSplitter = (text: string): string => {
  const splitterIndex = findQuoteSplitterIndex(text);
  const beforeSplitter =
    splitterIndex === -1 ? text : text.slice(0, splitterIndex);

  return (beforeSplitter.trim() === '' ? text : beforeSplitter).replace(
    ALL_QUOTE_MARKERS,
    '',
  );
};

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

const SANITIZE_OPTIONS = {
  allowedTags: TEXT_SHAPING_TAGS,
  allowedAttributes: {
    a: ['href'],
    img: ['src', 'alt'],
    '*': ['title', 'class', 'id', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  disallowedTagsMode: 'discard',
  nonTextTags: NON_TEXT_TAGS,
} satisfies sanitizeHtml.IOptions;

export const convertHtmlToText = (html: string): string =>
  normalizeMessageText(
    cutAtQuoteSplitter(
      convert(sanitizeHtml(html, SANITIZE_OPTIONS), CONVERT_OPTIONS),
    ),
  );
