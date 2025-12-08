import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isGmailApiBatchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-api-batch-error.util';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';
import { parseGmailApiBatchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-api-batch-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailMessagesImportErrorHandler {
  private readonly logger = new Logger(GmailMessagesImportErrorHandler.name);

  constructor() {}

  public handleError(error: unknown, messageExternalId: string): void {
    this.logger.error(
      `Gmail: Error importing messages: ${JSON.stringify(error)}`,
    );

    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    if (isGmailApiBatchError(error)) {
      const exception = parseGmailApiBatchError(error, messageExternalId);

      if (!isDefined(exception)) {
        return;
      }

      throw exception;
    }

    throw new MessageImportDriverException(
      'Unknown error',
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
