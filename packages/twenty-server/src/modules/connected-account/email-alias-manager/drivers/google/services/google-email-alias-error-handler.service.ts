import { Injectable, Logger } from '@nestjs/common';

import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';
import { parseGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-network-error.util';

@Injectable()
export class GmailEmailAliasErrorHandlerService {
  private readonly logger = new Logger(GmailEmailAliasErrorHandlerService.name);

  constructor() {}

  public handleError(error: unknown): void {
    if (isGmailNetworkError(error)) {
      throw parseGmailNetworkError(error);
    }

    // throw parseGmailEmailAliasError(error as Record<string, unknown>, {
    //   cause: error,
    // });
  }
}
