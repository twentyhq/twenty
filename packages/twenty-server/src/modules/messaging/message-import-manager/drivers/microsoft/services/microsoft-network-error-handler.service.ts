import { Injectable, Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';
import { isMicrosoftClientTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-temporary-error.utils';

@Injectable()
export class MicrosoftNetworkErrorHandler {
  private readonly logger = new Logger(MicrosoftNetworkErrorHandler.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any): MessageImportDriverException | null {
    if (isAccessTokenRefreshingError(error?.body)) {
      return new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
        { cause: error },
      );
    }

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
