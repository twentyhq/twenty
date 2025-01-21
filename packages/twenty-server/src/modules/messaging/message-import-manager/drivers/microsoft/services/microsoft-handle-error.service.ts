import { Injectable } from '@nestjs/common';

import { GraphError } from '@microsoft/microsoft-graph-client';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

@Injectable()
export class MicrosoftHandleErrorService {
  public handleMicrosoftMessageFetchError(error: GraphError): void {
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
      `Microsoft Graph API error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
