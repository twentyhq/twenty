import { Injectable, Logger } from '@nestjs/common';

import { MessagingGmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/messaging-gmail-client.provider';

@Injectable()
export class MessagingGmailGetAliasesService {
  private readonly logger = new Logger(MessagingGmailGetAliasesService.name);

  constructor(
    private readonly gmailClientProvider: MessagingGmailClientProvider,
  ) {}
}
