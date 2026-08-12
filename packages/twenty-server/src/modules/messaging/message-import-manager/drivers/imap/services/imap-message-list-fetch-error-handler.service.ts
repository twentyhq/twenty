import { Injectable } from '@nestjs/common';

import { parseImapMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-message-list-fetch-error.util';

@Injectable()
export class ImapMessageListFetchErrorHandler {
  public handleError(error: Error): void {
    throw parseImapMessageListFetchError(error, { cause: error });
  }
}
