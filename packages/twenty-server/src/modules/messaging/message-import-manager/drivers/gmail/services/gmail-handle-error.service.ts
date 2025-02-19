import { Injectable } from '@nestjs/common';

import { parseGaxiosError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gaxios-error.util';
import { parseGmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message-list-fetch-error.util';
import { parseGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-messages-import-error.util';

@Injectable()
export class GmailHandleErrorService {
  constructor() {}

  public handleGmailMessageListFetchError(error: any): void {
    const gaxiosError = parseGaxiosError(error);

    if (gaxiosError) {
      throw gaxiosError;
    }

    throw parseGmailMessageListFetchError(error);
  }

  public handleGmailMessagesImportError(
    error: any,
    messageExternalId: string,
  ): void {
    const gaxiosError = parseGaxiosError(error);

    if (gaxiosError) {
      throw gaxiosError;
    }

    const gmailError = parseGmailMessagesImportError(error, messageExternalId);

    if (gmailError) {
      throw gmailError;
    }
  }
}
