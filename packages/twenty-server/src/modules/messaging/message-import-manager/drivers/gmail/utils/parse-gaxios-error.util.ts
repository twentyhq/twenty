import { GaxiosError } from 'gaxios';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGaxiosError = (
  error: GaxiosError,
): MessageImportDriverException | undefined => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    default:
      return undefined;
  }
};
