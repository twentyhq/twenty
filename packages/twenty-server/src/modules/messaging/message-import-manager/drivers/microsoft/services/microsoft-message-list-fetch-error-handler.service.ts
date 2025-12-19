import { Injectable, Logger } from '@nestjs/common';

import { MicrosoftNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-network-error-handler.service';
import { parseMicrosoftMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/parse-microsoft-messages-import.util';

@Injectable()
export class MicrosoftMessageListFetchErrorHandler {
  private readonly logger = new Logger(
    MicrosoftMessageListFetchErrorHandler.name,
  );

  constructor(
    private readonly microsoftNetworkErrorHandler: MicrosoftNetworkErrorHandler,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any): void {
    this.logger.log(`Error fetching message list: ${JSON.stringify(error)}`);

    const networkError = this.microsoftNetworkErrorHandler.handleError(error);

    if (networkError) {
      throw networkError;
    }

    throw parseMicrosoftMessagesImportError(error, { cause: error });
  }
}
