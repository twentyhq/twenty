import { Injectable, Logger } from '@nestjs/common';

import { parseGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-messages-import-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailMessagesImportErrorHandler {
  private readonly logger = new Logger(GmailMessagesImportErrorHandler.name);

  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any, messageExternalId: string): void {
    this.logger.log(`Error fetching messages`, error);

    const networkError = parseGmailNetworkError(error);

    if (networkError) {
      throw networkError;
    }

    const gmailError = parseGmailMessagesImportError(error, messageExternalId, {
      cause: error,
    });

    if (gmailError) {
      throw gmailError;
    }
  }
}
