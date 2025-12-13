import { Injectable, Logger } from '@nestjs/common';

import { GaxiosError } from 'gaxios';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';
import { parseGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-api-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailFoldersErrorHandlerService {
  private readonly logger = new Logger(GmailFoldersErrorHandlerService.name);

  constructor() {}

  public handleError(error: unknown): void {
    this.logger.error(
      `Gmail: Error fetching folders: ${JSON.stringify(error)}`,
    );
    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    if (error instanceof GaxiosError) {
      throw parseGmailApiError(error);
    }

    throw new MessageImportDriverException(
      'Unknown error',
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
