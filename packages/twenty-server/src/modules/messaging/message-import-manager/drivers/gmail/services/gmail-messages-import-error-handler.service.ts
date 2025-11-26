import { Injectable, Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-messages-import.util';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';
import { parseGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-messages-import-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailMessagesImportErrorHandler {
  private readonly logger = new Logger(GmailMessagesImportErrorHandler.name);

  constructor() {}

  public handleError(error: unknown, messageExternalId: string): void {
    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    if (isGmailMessagesImportError(error)) {
      throw parseGmailMessagesImportError(error, messageExternalId);
    }

    this.logger.error(`Error importing messages: ${error}`);
    throw new MessageImportDriverException(
      'Unknown error',
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
