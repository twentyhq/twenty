import { Module } from '@nestjs/common';

import { GmailMessageListFetchErrorHandlingService } from 'src/modules/messaging/services/gmail-message-list-fetch-error-handling/gmail-message-list-fetch-error-handling.service';
import { SetMessageChannelSyncStatusModule } from 'src/modules/messaging/services/set-message-channel-sync-status/set-message-channel-sync-status.module';

@Module({
  imports: [SetMessageChannelSyncStatusModule],
  providers: [GmailMessageListFetchErrorHandlingService],
  exports: [
    GmailMessageListFetchErrorHandlingService,
    GmailMessageListFetchErrorHandlingService,
  ],
})
export class GmailMessageListFetchErrorHandlingModule {}
