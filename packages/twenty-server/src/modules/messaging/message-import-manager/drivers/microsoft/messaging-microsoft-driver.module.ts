import { Module } from '@nestjs/common';

import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import { MicrosoftMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-message-list-fetch-error-handler.service';
import { MicrosoftMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-messages-import-error-handler.service';
import { MicrosoftNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-network-error-handler.service';

import { MicrosoftGetMessageListService } from './services/microsoft-get-message-list.service';

@Module({
  imports: [OAuth2ClientManagerModule],
  providers: [
    MicrosoftGetMessageListService,
    MicrosoftGetMessagesService,
    MicrosoftFetchByBatchService,
    MicrosoftNetworkErrorHandler,
    MicrosoftMessageListFetchErrorHandler,
    MicrosoftMessagesImportErrorHandler,
  ],
  exports: [
    MicrosoftGetMessageListService,
    MicrosoftGetMessagesService,
    MicrosoftMessageListFetchErrorHandler,
    MicrosoftMessagesImportErrorHandler,
  ],
})
export class MessagingMicrosoftDriverModule {}
