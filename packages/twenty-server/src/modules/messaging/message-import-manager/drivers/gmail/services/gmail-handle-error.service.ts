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
    if (error.response?.status !== 410) {
      const gmailError = {
        code: error.response?.status,
        reason: `${error.response?.data?.error?.errors?.[0].reason || error.response?.data?.error || ''}`,
        message: `${error.response?.data?.error?.errors?.[0].message || error.response?.data?.error_description || ''}${messageExternalId ? ` for message with externalId: ${messageExternalId}` : ''}`,
      };

      throw parseGmailError(gmailError);
    }
  }
}
