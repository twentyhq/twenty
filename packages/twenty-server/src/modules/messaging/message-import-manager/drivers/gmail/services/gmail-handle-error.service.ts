import { Injectable } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isAxiosTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-axios-gaxios-error.util';
import { parseGmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message-list-fetch-error.util';
import { parseGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-messages-import-error.util';

@Injectable()
export class GmailHandleErrorService {
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleGmailMessageListFetchError(error: any): void {
    if (isAxiosTemporaryError(error)) {
      throw new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    throw parseGmailMessageListFetchError(error);
  }

  public handleGmailMessagesImportError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    messageExternalId: string,
  ): void {
    if (isAxiosTemporaryError(error)) {
      throw new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    const gmailError = parseGmailMessagesImportError(error, messageExternalId);

    if (gmailError) {
      throw gmailError;
    }
  }
}
