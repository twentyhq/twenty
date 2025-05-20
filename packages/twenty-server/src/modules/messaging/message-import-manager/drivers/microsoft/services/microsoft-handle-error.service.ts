import { Injectable } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MicrosoftImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/microsoft/exceptions/microsoft-import-driver.exception';

@Injectable()
export class MicrosoftHandleErrorService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    if (error.statusCode === 404) {
      if (
        error.message.includes(
          'The mailbox is either inactive, soft-deleted, or is hosted on-premise.',
        )
      ) {
        throw new MessageImportDriverException(
          `Disabled, deleted, inactive or no licence Microsoft account - code:${error.code}`,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      } else {
        throw new MessageImportDriverException(
          `Not found - code:${error.code}`,
          MessageImportDriverExceptionCode.NOT_FOUND,
        );
      }
    }

    if (error.statusCode === 429) {
      throw new MessageImportDriverException(
        `Microsoft Graph API ${error.code} ${error.statusCode} error: ${error.message}`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    throw new MessageImportDriverException(
      `Microsoft driver error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public throwMicrosoftBatchError(error: any): void {
    throw new MicrosoftImportDriverException(
      error.message,
      error.code,
      error.statusCode,
    );
  }
}
