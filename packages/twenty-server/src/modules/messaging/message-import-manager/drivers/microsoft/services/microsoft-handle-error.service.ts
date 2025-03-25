import { Injectable } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

@Injectable()
export class MicrosoftHandleErrorService {
  public handleMicrosoftMessageFetchError(error: any): void {
    if (!error.statusCode) {
      throw new MessageImportDriverException(
        `Microsoft Graph API unknown error: ${error}`,
        MessageImportDriverExceptionCode.UNKNOWN,
      );
    }

    if (error.statusCode === 401) {
      throw new MessageImportDriverException(
        'Unauthorized access to Microsoft Graph API',
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    if (error.statusCode === 403) {
      throw new MessageImportDriverException(
        'Forbidden access to Microsoft Graph API',
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    throw new MessageImportDriverException(
      `Microsoft driver error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
