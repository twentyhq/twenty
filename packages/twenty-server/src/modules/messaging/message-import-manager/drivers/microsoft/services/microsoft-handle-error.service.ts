import { Injectable, Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isMicrosoftClientTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-temporary-error.utils';
import { parseMicrosoftMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/parse-microsoft-messages-import.util';

@Injectable()
export class MicrosoftHandleErrorService {
  private readonly logger = new Logger(MicrosoftHandleErrorService.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleMicrosoftMessageFetchByBatchError(error: any): void {
    // TODO: remove this log once we catch better the error codes
    this.logger.error(`Error temporary (${error.code}) fetching messages`);
    this.logger.log(error);

    const isBodyString = error.body && typeof error.body === 'string';
    const isTemporaryError =
      isBodyString && isMicrosoftClientTemporaryError(error.body);

    if (isTemporaryError) {
      throw new MessageImportDriverException(
        `code: ${error.code} - body: ${error.body}`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    if (!error.statusCode) {
      throw new MessageImportDriverException(
        `Microsoft Graph API unknown error: ${error}`,
        MessageImportDriverExceptionCode.UNKNOWN,
      );
    }

    const exception = parseMicrosoftMessagesImportError(error);

    if (exception) {
      throw exception;
    }

    throw new MessageImportDriverException(
      `Microsoft driver error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleMicrosoftGetMessageListError(error: any): void {
    if (!error.statusCode) {
      throw new MessageImportDriverException(
        `Microsoft Graph API unknown error: ${error}`,
        MessageImportDriverExceptionCode.UNKNOWN,
      );
    }

    const exception = parseMicrosoftMessagesImportError(error);

    if (exception) {
      throw exception;
    }

    throw new MessageImportDriverException(
      `Microsoft driver error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleMicrosoftGetMessagesError(error: any): void {
    if (
      error instanceof MessageImportDriverException &&
      error.code === MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE
    ) {
      throw error;
    }

    if (!error.statusCode) {
      throw new MessageImportDriverException(
        `Microsoft Graph API unknown error: ${error}`,
        MessageImportDriverExceptionCode.UNKNOWN,
      );
    }

    const exception = parseMicrosoftMessagesImportError(error);

    if (exception) {
      throw exception;
    }

    throw new MessageImportDriverException(
      `Microsoft driver error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }
}
