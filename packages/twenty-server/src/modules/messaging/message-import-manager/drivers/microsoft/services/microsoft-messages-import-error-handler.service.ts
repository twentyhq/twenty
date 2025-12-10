import { Injectable, Logger } from '@nestjs/common';

import { MicrosoftNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-network-error-handler.service';
import { parseMicrosoftMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/parse-microsoft-messages-import.util';

@Injectable()
export class MicrosoftMessagesImportErrorHandler {
  private readonly logger = new Logger(
    MicrosoftMessagesImportErrorHandler.name,
  );

  constructor(
    private readonly microsoftNetworkErrorHandler: MicrosoftNetworkErrorHandler,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any): void {
    this.logger.log(`Error fetching messages: ${JSON.stringify(error)}`);

    const networkError = this.microsoftNetworkErrorHandler.handleError(error);

    if (networkError) {
      throw networkError;
    }

    throw parseMicrosoftMessagesImportError(error, { cause: error });
  }
}
