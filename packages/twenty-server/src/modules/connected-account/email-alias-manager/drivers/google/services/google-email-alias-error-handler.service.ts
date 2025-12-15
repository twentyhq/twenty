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
export class GmailEmailAliasErrorHandlerService {
  private readonly logger = new Logger(GmailEmailAliasErrorHandlerService.name);

  constructor() {}

  public handleError(error: unknown): void {
    this.logger.error(`Google: Error getting email aliases: ${error}`);
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
