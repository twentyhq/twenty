import { isNonEmptyString } from '@sniptt/guards';

import { type MessageBody } from 'src/modules/messaging/message-import-manager/types/message-body.type';
import { convertHtmlToText } from 'src/modules/messaging/message-import-manager/utils/convert-html-to-text.util';

const INLINE_IMAGE_REFERENCE = /[[(<]?\bcid:[^\s\])>"']+[\])>]?/gi;

export const readBodyAsText = ({ text, html }: MessageBody): string => {
  if (isNonEmptyString(text)) {
    return text.replace(INLINE_IMAGE_REFERENCE, '');
  }

  if (isNonEmptyString(html)) {
    return convertHtmlToText(html).replace(INLINE_IMAGE_REFERENCE, '');
  }

  return '';
};
