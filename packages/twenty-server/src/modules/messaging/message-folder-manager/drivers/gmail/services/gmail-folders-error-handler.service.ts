import { Injectable, Logger } from '@nestjs/common';

import { isGmailEmailAliasError } from 'src/modules/connected-account/email-alias-manager/drivers/google/utils/is-gmail-email-alias-error';
import { parseGmailEmailAliasError } from 'src/modules/connected-account/email-alias-manager/drivers/google/utils/parse-gmail-email-alias-error.util';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailFoldersErrorHandlerService {
  private readonly logger = new Logger(GmailFoldersErrorHandlerService.name);

  constructor() {}

  public handleError(error: unknown): void {
    this.logger.log(`Error fetching folders`, error);

    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    if (isGmailEmailAliasError(error)) {
      throw parseGmailEmailAliasError(error);
    }

    throw new MessageImportDriverException(
      'Unknown error',
      MessageImportDriverExceptionCode.UNKNOWN,
      { cause: error as Error },
    );
  }
}
