import sanitizeHtml from 'sanitize-html';

import { MESSAGE_HTML_SANITIZE_OPTIONS } from 'src/modules/messaging/message-import-manager/utils/message-html-sanitize-options.constant';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';
import { removeQuotedMarkup } from 'src/modules/messaging/message-import-manager/utils/remove-quoted-markup.util';
import { renderHtmlWithQuoteMarkers } from 'src/modules/messaging/message-import-manager/utils/render-html-with-quote-markers.util';

export const convertHtmlToText = (html: string): string => {
  const safeHtml = sanitizeHtml(html, MESSAGE_HTML_SANITIZE_OPTIONS);
  const markedText = renderHtmlWithQuoteMarkers(safeHtml);
  const withoutQuotedMarkup = removeQuotedMarkup(markedText);

  return normalizeMessageText(withoutQuotedMarkup);
};
