import { type GaxiosError } from 'gaxios';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isAxiosTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-axios-gaxios-error.util';

export const parseGmailNetworkError = (
  error: GaxiosError,
): MessageImportDriverException | null => {
  if (isAxiosTemporaryError(error)) {
    return new MessageImportDriverException(
      error.message,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: error },
    );
  }

  return null;
};
