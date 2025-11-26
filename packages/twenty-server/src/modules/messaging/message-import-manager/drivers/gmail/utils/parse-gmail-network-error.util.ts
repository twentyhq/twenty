import { type GaxiosError } from 'gaxios';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGmailNetworkError = (
  error: GaxiosError,
): MessageImportDriverException | null => {
  return new MessageImportDriverException(
    error.message,
    MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    { cause: error },
  );
};
