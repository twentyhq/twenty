import { Injectable } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isAxiosTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-axios-gaxios-error.util';

@Injectable()
export class GmailNetworkErrorHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any): MessageImportDriverException | null {
    if (isAxiosTemporaryError(error)) {
      return new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        { cause: error },
      );
    }

    return null;
  }
}
