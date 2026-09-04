import {
  convert,
  type FormatCallback,
  type HtmlToTextOptions,
} from 'html-to-text';

import { HTML_QUOTE_SELECTORS } from 'src/modules/messaging/message-import-manager/utils/html-quote-selectors.constant';
import { QUOTE_MARKERS } from 'src/modules/messaging/message-import-manager/utils/quote-markers.constant';

const markQuoteContainer: FormatCallback = (element, walk, builder) => {
  builder.addInline(QUOTE_MARKERS.containerOpen);
  walk(element.children, builder);
  builder.addInline(QUOTE_MARKERS.containerClose);
};

const buildSplitterMarker =
  (marker: string): FormatCallback =>
  (element, walk, builder) => {
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
    quoteContainer: markQuoteContainer,
    quoteSplitter: buildSplitterMarker(QUOTE_MARKERS.splitter),
    repeatedQuoteSplitter: buildSplitterMarker(QUOTE_MARKERS.repeatedSplitter),
  },
} satisfies HtmlToTextOptions;

export const renderHtmlWithQuoteMarkers = (safeHtml: string): string =>
  convert(safeHtml, CONVERT_OPTIONS);
