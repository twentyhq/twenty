import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 as gmailV1 } from 'googleapis';

import { getPropertyFromHeaders } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/get-property-from-headers.util';

export const isGmailInlineMessagePart = (
  part: gmailV1.Schema$MessagePart,
): boolean => {
  const message = { payload: part };

  return (
    isNonEmptyString(getPropertyFromHeaders(message, 'Content-ID')) ||
    (getPropertyFromHeaders(message, 'Content-Disposition') ?? '')
      .trim()
      .toLowerCase()
      .startsWith('inline')
  );
};
