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
    const constructorName = (error as unknown)?.constructor?.name ?? 'Unknown';

    this.logger.error(
      `Gmail: Error fetching message list: ${JSON.stringify(error)}, constructor: ${constructorName}`,
    );
    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    if (isGmailApiError(error)) {
      throw parseGmailApiError(error);
    }

    throw new MessageImportDriverException(
      'Unknown error',
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
