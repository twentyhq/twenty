import { isNonEmptyString } from '@sniptt/guards';

import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
import { extractTextWithoutReplyQuotations } from 'src/modules/messaging/message-import-manager/utils/extract-text-without-reply-quotations.util';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

// createHtmlToTextConverter builds a JSDOM + DOMPurify instance, which is
// expensive. extractMessageBodyText runs once per message, so an import batch
// (hundreds of emails) would build hundreds of JSDOMs on the worker event loop.
// The converter is stateless across calls, so build it once and reuse it.
let htmlToTextConverter: ((html: string) => string) | undefined;

const getHtmlToTextConverter = (): ((html: string) => string) => {
  htmlToTextConverter ??= createHtmlToTextConverter();

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
      ? getHtmlToTextConverter()(html)
      : '';

  const textWithoutReplyQuotations =
    extractTextWithoutReplyQuotations(candidate);
  const sanitizedText = sanitizeString(textWithoutReplyQuotations);

  return normalizeMessageText(sanitizedText);
};
