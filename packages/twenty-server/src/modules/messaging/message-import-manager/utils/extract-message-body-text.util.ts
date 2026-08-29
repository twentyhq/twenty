import { isNonEmptyString } from '@sniptt/guards';

import { messagingHtmlConversionContextStorage } from 'src/modules/messaging/message-import-manager/storage/messaging-html-conversion-context.storage';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
import { extractTextWithoutReplyQuotations } from 'src/modules/messaging/message-import-manager/utils/extract-text-without-reply-quotations.util';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

// createHtmlToTextConverter builds a JSDOM + DOMPurify instance, which is
// expensive. extractMessageBodyText runs once per message, so an import batch
// (hundreds of emails) would build hundreds of JSDOMs on the worker event loop.
// The converter is stateless across calls, so build one per variant and reuse it.
const htmlToTextConverters = new Map<boolean, (html: string) => string>();

const getHtmlToTextConverter = (
  shouldSkipReplyQuotationExtraction: boolean,
): ((html: string) => string) => {
  const existingConverter = htmlToTextConverters.get(
    shouldSkipReplyQuotationExtraction,
  );

  if (existingConverter !== undefined) {
    return existingConverter;
  }

  const converter = createHtmlToTextConverter({
    shouldSkipReplyQuotationExtraction,
  });

  htmlToTextConverters.set(shouldSkipReplyQuotationExtraction, converter);

  return converter;
};

export const extractMessageBodyText = ({
  text,
  html,
}: {
  text?: string | null;
  html?: string | null;
}): string => {
  const shouldSkipReplyQuotationExtraction =
    messagingHtmlConversionContextStorage.getStore()
      ?.shouldSkipHtmlReplyQuotationExtraction ?? false;

  const candidate = isNonEmptyString(text)
    ? text
    : isNonEmptyString(html)
      ? getHtmlToTextConverter(shouldSkipReplyQuotationExtraction)(html)
      : '';

  const textWithoutReplyQuotations =
    extractTextWithoutReplyQuotations(candidate);
  const sanitizedText = sanitizeString(textWithoutReplyQuotations);

  return normalizeMessageText(sanitizedText);
};
