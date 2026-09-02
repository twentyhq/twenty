import { isNonEmptyString } from '@sniptt/guards';

import { type MessageBody } from 'src/modules/messaging/message-import-manager/types/message-body.type';
import { convertHtmlToText } from 'src/modules/messaging/message-import-manager/utils/convert-html-to-text.util';

// Clients that inline images also paste the Content-ID into the text
// alternative, where it reads as [cid:image001.png@01DA...] noise.
const INLINE_IMAGE_REFERENCE = /\[?\bcid:[^\s\]<>"']+\]?/gi;

export const readBodyAsText = ({ text, html }: MessageBody): string => {
  if (isNonEmptyString(text)) {
    return text.replace(INLINE_IMAGE_REFERENCE, '');
  }

  if (isNonEmptyString(html)) {
    return convertHtmlToText(html).replace(INLINE_IMAGE_REFERENCE, '');
  }

  return '';
};
