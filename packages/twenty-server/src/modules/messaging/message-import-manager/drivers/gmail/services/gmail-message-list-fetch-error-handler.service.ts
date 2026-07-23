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
export class GmailMessageListFetchErrorHandler {
  private readonly logger = new Logger(GmailMessageListFetchErrorHandler.name);

  constructor() {}

  public handleError(error: unknown): void {
    if (isGmailNetworkError(error)) {
      this.logger.warn(
        `Gmail: Network error fetching message list: ${error.message}`,
      );
      throw parseGmailNetworkError(error);
    }

    if (isGmailApiError(error)) {
      const status = error.response?.status;
      const parsedError = parseGmailApiError(error);
      const logMessage = `Gmail: Error fetching message list (status ${status}): ${parsedError.message}`;

      if (parsedError.code === MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR) {
        this.logger.debug(logMessage);
      } else if (
        parsedError.code === MessageImportDriverExceptionCode.TEMPORARY_ERROR
      ) {
        this.logger.warn(logMessage);
      } else {
        this.logger.error(logMessage);
      }

      throw parsedError;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    this.logger.error(`Gmail: Error fetching message list: ${errorMessage}`);

    throw new MessageImportDriverException(
      `Gmail message list fetch error: ${errorMessage}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
