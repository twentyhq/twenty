import { isNonEmptyString } from '@sniptt/guards';

import { convertHtmlToText } from 'src/modules/messaging/message-import-manager/utils/convert-html-to-text.util';
import { extractTextWithoutReplyQuotations } from 'src/modules/messaging/message-import-manager/utils/extract-text-without-reply-quotations.util';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

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
      ? convertHtmlToText(html)
      : '';

  const textWithoutReplyQuotations =
    extractTextWithoutReplyQuotations(candidate);
  const sanitizedText = sanitizeString(textWithoutReplyQuotations);

  return normalizeMessageText(sanitizedText);
};
