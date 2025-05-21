import { GaxiosError } from 'gaxios';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';

export const parseGaxiosError = (
  error: GaxiosError,
): MessageImportDriverException | undefined => {
  const { code } = error;

  switch (code) {
    case MessageNetworkExceptionCode.ECONNRESET:
    case MessageNetworkExceptionCode.ENOTFOUND:
    case MessageNetworkExceptionCode.ECONNABORTED:
    case MessageNetworkExceptionCode.ETIMEDOUT:
    case MessageNetworkExceptionCode.ERR_NETWORK:
      return new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    default:
      return undefined;
  }
};
