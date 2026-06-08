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
      const parsedError = parseGmailNetworkError(error);

      this.logger.warn(
        `Gmail: Temporary network error importing message ${messageExternalId}: ${parsedError.message}`,
      );

      throw parsedError;
    }

    if (isGmailApiError(error)) {
      const status = error.response?.status;

      // 404/410 means message was deleted - skip silently
      if (status === 404 || status === 410) {
        this.logger.debug(
          `Gmail: Message ${messageExternalId} not found (status ${status}), skipping import`,
        );

        return;
      }

      const parsedError = parseGmailApiError(error);

      this.logger.error(
        `Gmail: API error importing message ${messageExternalId} (status ${status ?? 'unknown'}): ${parsedError.message}`,
      );

      throw parsedError;
    }

    const errorMessage =
      error instanceof Error ? error.message : String(error);

    this.logger.error(
      `Gmail: Unknown error importing message ${messageExternalId}: ${errorMessage}`,
    );

    throw new MessageImportDriverException(
      `Gmail message import error: ${errorMessage}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
