import { Injectable, Logger } from '@nestjs/common';

import { parseImapError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-error.util';
import { parseImapMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-messages-import-error.util';

@Injectable()
export class ImapMessagesImportErrorHandler {
  private readonly logger = new Logger(ImapMessagesImportErrorHandler.name);

  public handleError(error: Error, messageExternalId: string): void {
    this.logger.error(
      `IMAP: Error importing message ${messageExternalId}: ${JSON.stringify(error)}`,
    );

    const networkError = parseImapError(error, { cause: error });

    if (networkError) {
      throw networkError;
    }

    throw parseImapMessagesImportError(error, messageExternalId, {
      cause: error,
    });
  }
}
