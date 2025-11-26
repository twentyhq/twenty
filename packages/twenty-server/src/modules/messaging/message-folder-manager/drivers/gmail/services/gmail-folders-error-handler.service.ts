import { Injectable, Logger } from '@nestjs/common';

import { isGmailFoldersError } from 'src/modules/messaging/message-folder-manager/drivers/gmail/utils/is-gmail-folders-error.util';
import { parseGmailFoldersError } from 'src/modules/messaging/message-folder-manager/drivers/gmail/utils/parse-gmail-folders-error.util';
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
    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    if (isGmailFoldersError(error)) {
      throw parseGmailFoldersError(error);
    }

    this.logger.error(`Error fetching folders: ${error}`);
    throw new MessageImportDriverException(
      'Unknown error',
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
