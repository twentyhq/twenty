import { Injectable, Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isGmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-message-list-fetch-error.util';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';
import { parseGmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message-list-fetch-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailMessageListFetchErrorHandler {
  private readonly logger = new Logger(GmailMessageListFetchErrorHandler.name);

  constructor() {}

  public handleError(error: unknown): void {
    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    if (isGmailMessageListFetchError(error)) {
      throw parseGmailMessageListFetchError(error);
    }

    this.logger.error(`Error fetching message list: ${error}`);
    throw new MessageImportDriverException(
      'Unknown error',
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
