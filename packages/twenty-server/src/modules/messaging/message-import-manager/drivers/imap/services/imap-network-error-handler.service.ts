import { Injectable } from '@nestjs/common';

import { type MessageImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseImapError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-error.util';

@Injectable()
export class ImapNetworkErrorHandler {
  public handleError(error: Error): MessageImportDriverException | null {
    return parseImapError(error, { cause: error });
  }
}
