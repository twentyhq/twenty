import { Injectable } from '@nestjs/common';

import { parseImapMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-messages-import-error.util';
import { ImapNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-network-error-handler.service';

@Injectable()
export class ImapMessagesImportErrorHandler {
  constructor(
    private readonly imapNetworkErrorHandler: ImapNetworkErrorHandler,
  ) {}

  public handleError(error: Error, messageExternalId: string): void {
    const networkError = this.imapNetworkErrorHandler.handleError(error);

    if (networkError) {
      throw networkError;
    }

    throw parseImapMessagesImportError(error, messageExternalId, {
      cause: error,
    });
  }
}
