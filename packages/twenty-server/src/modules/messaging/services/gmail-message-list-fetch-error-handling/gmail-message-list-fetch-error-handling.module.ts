import { Module } from '@nestjs/common';

import { GmailMessageListFetchErrorHandlingService } from 'src/modules/messaging/services/gmail-message-list-fetch-error-handling/gmail-message-list-fetch-error-handling.service';

@Module({
  imports: [],
  providers: [GmailMessageListFetchErrorHandlingService],
  exports: [
    GmailMessageListFetchErrorHandlingService,
    GmailMessageListFetchErrorHandlingService,
  ],
})
export class GmailMessageListFetchErrorHandlingModule {}
