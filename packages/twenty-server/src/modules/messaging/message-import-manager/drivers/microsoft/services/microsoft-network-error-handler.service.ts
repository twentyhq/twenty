import { Injectable, Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isMicrosoftClientTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-temporary-error.utils';

@Injectable()
export class MicrosoftNetworkErrorHandler {
  private readonly logger = new Logger(MicrosoftNetworkErrorHandler.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any): MessageImportDriverException | null {
    const isBodyString = error.body && typeof error.body === 'string';
    const isTemporaryError =
      isBodyString && isMicrosoftClientTemporaryError(error.body);

    if (isTemporaryError) {
      return new MessageImportDriverException(
        `code: ${error.code} - body: ${error.body}`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        { cause: error },
      );
    }

    return null;
  }
}
