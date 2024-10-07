import { Module } from '@nestjs/common';

import { MessagingConnectedAccountDeletionCleanupJob } from 'src/modules/messaging/message-cleaner/jobs/messaging-connected-account-deletion-cleanup.job';
import { MessagingMessageCleanerConnectedAccountListener } from 'src/modules/messaging/message-cleaner/listeners/messaging-message-cleaner-connected-account.listener';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

@Module({
  imports: [],
  providers: [
    MessagingMessageCleanerService,
    MessagingConnectedAccountDeletionCleanupJob,
    MessagingMessageCleanerConnectedAccountListener,
  ],
  exports: [MessagingMessageCleanerService],
})
export class MessagingMessageCleanerModule {}
