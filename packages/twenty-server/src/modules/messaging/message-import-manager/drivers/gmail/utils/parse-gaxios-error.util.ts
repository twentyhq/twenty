import { GaxiosError } from 'gaxios';

import {
  MessagingException,
  MessagingExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/messaging.exception';

export const parseGaxiosError = (error: GaxiosError): MessagingException => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return new MessagingException(
        error.message,
        MessagingExceptionCode.TEMPORARY_ERROR,
      );

    default:
      return new MessagingException(
        error.message,
        MessagingExceptionCode.UNKNOWN,
      );
  }
};
