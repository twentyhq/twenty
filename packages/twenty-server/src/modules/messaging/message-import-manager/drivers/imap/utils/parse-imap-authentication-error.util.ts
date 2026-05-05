import { isDefined } from 'twenty-shared/utils';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { type ImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/types/imap-error.type';
import { isImapNetworkError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-network-error.util';

const TRANSIENT_IMAP_RESPONSE_CODES = new Set([
  'UNAVAILABLE',
  'INUSE',
  'SERVERBUG',
]);

export const parseImapAuthenticationError = (
  error: ImapFlowError,
): MessageImportDriverException => {
  if (isImapNetworkError(error)) {
    return new MessageImportDriverException(
      `IMAP network error: ${error.message}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: error },
    );
  }

  if (
    isDefined(error.serverResponseCode) &&
    TRANSIENT_IMAP_RESPONSE_CODES.has(error.serverResponseCode)
  ) {
    return new MessageImportDriverException(
      `IMAP transient error [${error.serverResponseCode}]: ${error.responseText ?? error.message}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: error },
    );
  }

  if (error.authenticationFailed === true) {
    return new MessageImportDriverException(
      `IMAP authentication error: ${error.message}`,
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: error },
    );
  }

  return new MessageImportDriverException(
    `Unknown IMAP authentication error: ${error.message}`,
    MessageImportDriverExceptionCode.UNKNOWN,
    { cause: error },
  );
};
