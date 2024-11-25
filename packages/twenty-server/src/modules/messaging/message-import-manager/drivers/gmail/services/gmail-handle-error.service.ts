import { Injectable } from '@nestjs/common';

import { parseGaxiosError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gaxios-error.util';
import { parseGmailError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-error.util';

@Injectable()
export class GmailHandleErrorService {
  constructor() {}

  public handleError(error: any, messageExternalId?: string): void {
    if (
      error.code &&
      [
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNABORTED',
        'ETIMEDOUT',
        'ERR_NETWORK',
      ].includes(error.code)
    ) {
      throw parseGaxiosError(error);
    }

    const gmailError = {
      code: error.code,
      reason: `${error.errors[0].reason}`,
      message: `${error.errors[0].message}${messageExternalId ? ` for message with externalId: ${messageExternalId}` : ''}`,
    };

    throw parseGmailError(gmailError);
  }
}
