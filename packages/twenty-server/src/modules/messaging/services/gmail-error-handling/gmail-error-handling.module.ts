import { Module } from '@nestjs/common';

import { GmailErrorHandlingService } from 'src/modules/messaging/services/gmail-error-handling/gmail-error-handling.service';
import { SetMessageChannelSyncStatusModule } from 'src/modules/messaging/services/message-channel-sync-status/message-channel-sync-status.module';

@Module({
  imports: [SetMessageChannelSyncStatusModule],
  providers: [GmailErrorHandlingService],
  exports: [GmailErrorHandlingService],
})
export class GmailErrorHandlingModule {}
