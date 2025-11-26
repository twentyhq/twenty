import { Injectable, Logger } from '@nestjs/common';

import { parseGmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message-list-fetch-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailEmailAliasErrorHandlerService {
  private readonly logger = new Logger(GmailEmailAliasErrorHandlerService.name);

  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any): void {
    this.logger.log(`Error fetching message list`, error);

    const networkError = parseGmailNetworkError(error);

    if (networkError) {
      throw networkError;
    }

    throw parseGmailMessageListFetchError(error, { cause: error });
  }
}
