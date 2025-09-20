import { Injectable, Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';
import { isMicrosoftClientTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-temporary-error.utils';
import { parseMicrosoftMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/parse-microsoft-messages-import.util';

@Injectable()
export class MicrosoftHandleErrorService {
  private readonly logger = new Logger(MicrosoftHandleErrorService.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleMicrosoftGetMessageListError(error: any): void {
    this.logger.log(`Error fetching message list`, error);
    throw parseMicrosoftMessagesImportError(error);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleMicrosoftGetMessagesError(error: any): void {
    this.logger.log(`Error fetching messages`, error);
    if (isAccessTokenRefreshingError(error?.body)) {
      throw new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
      );
    }

    const isBodyString = error.body && typeof error.body === 'string';
    const isTemporaryError =
      isBodyString && isMicrosoftClientTemporaryError(error.body);

    if (isTemporaryError) {
      throw new MessageImportDriverException(
        `code: ${error.code} - body: ${error.body}`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    throw parseMicrosoftMessagesImportError(error);
  }
}
