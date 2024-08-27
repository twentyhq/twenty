import { GaxiosError } from 'gaxios';

import {
  MessagingDriverException,
  MessagingDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/messaging-driver.exception';

export const parseGaxiosError = (error: GaxiosError): MessagingDriverException => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return new MessagingDriverException(
        error.message,
        MessagingDriverExceptionCode.TEMPORARY_ERROR,
      );

    default:
      return new MessagingDriverException(
        error.message,
        MessagingDriverExceptionCode.UNKNOWN,
      );
  }
};
