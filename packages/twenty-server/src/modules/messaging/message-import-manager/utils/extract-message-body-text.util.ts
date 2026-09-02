import { isNonEmptyString } from '@sniptt/guards';

import { convertHtmlToText } from 'src/modules/messaging/message-import-manager/utils/convert-html-to-text.util';
import { normalizeMessageText } from 'src/modules/messaging/message-import-manager/utils/normalize-message-text.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';
import { stripQuotedHistory } from 'src/modules/messaging/message-import-manager/utils/strip-quoted-history.util';

type MessageBody = {
  text?: string | null;
  html?: string | null;
};

// Clients that inline images also paste the Content-ID into the text
// alternative, where it reads as [cid:image001.png@01DA...] noise.
const INLINE_IMAGE_REFERENCE = /\[?\bcid:[^\s\]<>"']+\]?/gi;

const readBodyAsText = ({ text, html }: MessageBody): string => {
  if (isNonEmptyString(text)) {
    return text;
  }

  if (isNonEmptyString(html)) {
    return convertHtmlToText(html);
  }

  return '';
};

export const extractMessageBodyText = (body: MessageBody): string => {
  const bodyAsText = readBodyAsText(body).replace(INLINE_IMAGE_REFERENCE, '');
  const withoutQuotedHistory = stripQuotedHistory(bodyAsText);

  return normalizeMessageText(sanitizeString(withoutQuotedHistory));
};
