import { Injectable } from '@nestjs/common';

import { parseGaxiosError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gaxios-error.util';
import { parseGmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message-list-fetch-error.util';
import { parseGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-messages-import-error.util';

@Injectable()
export class GmailHandleErrorService {
  constructor() {}

  public handleGaxiosError(error: any): void {
    const gaxiosError = parseGaxiosError(error);

    if (gaxiosError) {
      throw gaxiosError;
    }
  }

  public handleGmailMessageListFetchError(error: any): void {
    this.handleGaxiosError(error);

    const gmailError = parseGmailMessageListFetchError(error);

    if (gmailError) {
      throw gmailError;
    }
  }

  public handleGmailMessagesImportError(
    error: any,
    messageExternalId: string,
  ): void {
    this.handleGaxiosError(error);

    const gmailError = parseGmailMessagesImportError(error, messageExternalId);

    if (gmailError) {
      throw gmailError;
    }
  }
}
