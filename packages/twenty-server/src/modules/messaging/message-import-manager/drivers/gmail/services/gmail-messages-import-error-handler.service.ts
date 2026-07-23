import { Injectable, Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-api-error.util';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';
import { parseGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-api-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailMessagesImportErrorHandler {
  private readonly logger = new Logger(GmailMessagesImportErrorHandler.name);

  constructor() {}

  public handleError(error: unknown, messageExternalId: string): void {
    if (isGmailNetworkError(error)) {
      this.logger.warn(
        `Gmail: Network error importing message ${messageExternalId}: ${error.message}`,
      );
      throw parseGmailNetworkError(error);
    }

    if (isGmailApiError(error)) {
      const status = error.response?.status;

      // 404/410 means message was deleted and is expected during sync.
      if (status === 404 || status === 410) {
        this.logger.debug(
          `Gmail: Message ${messageExternalId} is no longer available (status ${status})`,
        );
        return;
      }

      const parsedError = parseGmailApiError(error);
      const logMessage = `Gmail: Error importing message ${messageExternalId} (status ${status}): ${parsedError.message}`;

      if (
        parsedError.code === MessageImportDriverExceptionCode.TEMPORARY_ERROR
      ) {
        this.logger.warn(logMessage);
      } else {
        this.logger.error(logMessage);
      }

      throw parsedError;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    this.logger.error(
      `Gmail: Error importing message ${messageExternalId}: ${errorMessage}`,
    );

    throw new MessageImportDriverException(
      `Gmail message import error: ${errorMessage}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
