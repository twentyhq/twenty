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
    if (
      isGmailApiError(error) &&
      (error.response?.status === 404 || error.response?.status === 410)
    ) {
      return;
    }

    this.logger.error(
      `Gmail: Error importing message ${messageExternalId}: ${JSON.stringify(error)}`,
    );

    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    if (isGmailApiError(error)) {
      throw parseGmailApiError(error);
    }

    throw new MessageImportDriverException(
      `Gmail message import error: ${error instanceof Error ? error.message : String(error)}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
