import { GaxiosError } from 'gaxios';

import {
  MessagingError,
  MessagingErrorCode,
} from 'src/modules/messaging/message-import-manager/types/messaging-error.type';

export const parseGaxiosError = (error: GaxiosError): MessagingError => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return {
        code: MessagingErrorCode.TEMPORARY_ERROR,
        message: error.message,
      };

    default:
      return {
        code: MessagingErrorCode.UNKNOWN,
        message: error.message,
      };
  }
};
