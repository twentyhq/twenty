import { Injectable } from '@nestjs/common';

import { parseImapMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-message-list-fetch-error.util';
import { ImapNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-network-error-handler.service';

@Injectable()
export class ImapMessageListFetchErrorHandler {
  constructor(
    private readonly imapNetworkErrorHandler: ImapNetworkErrorHandler,
  ) {}

  public handleError(error: Error): void {
    const networkError = this.imapNetworkErrorHandler.handleError(error);

    if (networkError) {
      throw networkError;
    }

    throw parseImapMessageListFetchError(error, { cause: error });
  }
}
