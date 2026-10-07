import { Module } from '@nestjs/common';

import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';

@Module({
  imports: [OAuth2ClientManagerModule],
  providers: [
    GmailGetHistoryService,
    GmailGetMessagesService,
    GmailGetMessageListService,
    GmailMessageListFetchErrorHandler,
    GmailMessagesImportErrorHandler,
  ],
  exports: [
    GmailGetMessagesService,
    GmailGetMessageListService,
    GmailMessageListFetchErrorHandler,
    GmailMessagesImportErrorHandler,
  ],
})
export class MessagingGmailDriverModule {}
