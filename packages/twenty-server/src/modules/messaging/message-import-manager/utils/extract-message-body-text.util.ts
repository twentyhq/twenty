import { isNonEmptyString } from '@sniptt/guards';

import {
  createHtmlToTextConverter,
  type HtmlToTextConverter,
} from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
import { extractTextWithoutReplyQuotations } from 'src/modules/messaging/message-import-manager/utils/extract-text-without-reply-quotations.util';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

// createHtmlToTextConverter builds a JSDOM + DOMPurify instance, which is
// expensive. extractMessageBodyText runs once per message, so an import batch
// (hundreds of emails) would build hundreds of JSDOMs on the worker event loop.
//
// It cannot be reused indefinitely either: jsdom records every id/name-bearing
// element in a named-properties map keyed by the window, and only drops entries
// when an element is detached. Documents built per message are discarded whole,
// never detached, so each converted email stays pinned to the window for as long
// as it lives. Recycling the converter bounds that retention.
export const MAX_CONVERSIONS_PER_CONVERTER = 100;

let htmlToTextConverter: HtmlToTextConverter | undefined;
let conversionsSinceRecycle = 0;

const getHtmlToTextConverter = (): HtmlToTextConverter => {
  if (
    htmlToTextConverter !== undefined &&
    conversionsSinceRecycle >= MAX_CONVERSIONS_PER_CONVERTER
  ) {
    htmlToTextConverter.close();
    htmlToTextConverter = undefined;
  }

  if (htmlToTextConverter === undefined) {
    htmlToTextConverter = createHtmlToTextConverter();
    conversionsSinceRecycle = 0;
  }

  conversionsSinceRecycle += 1;

  return htmlToTextConverter;
};

export const extractMessageBodyText = ({
  text,
  html,
}: {
  text?: string | null;
  html?: string | null;
}): string => {
  const candidate = isNonEmptyString(text)
    ? text
    : isNonEmptyString(html)
      ? getHtmlToTextConverter().convert(html)
      : '';

  const textWithoutReplyQuotations =
    extractTextWithoutReplyQuotations(candidate);
  const sanitizedText = sanitizeString(textWithoutReplyQuotations);

  return normalizeMessageText(sanitizedText);
};
