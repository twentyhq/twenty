import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { MessagingMessageCleanerRemoveOrphansCommand } from 'src/modules/messaging/message-cleaner/commands/messaging-message-clearner-remove-orphans.command';
import { MessagingConnectedAccountDeletionCleanupJob } from 'src/modules/messaging/message-cleaner/jobs/messaging-connected-account-deletion-cleanup.job';
import { MessagingMessageCleanerConnectedAccountListener } from 'src/modules/messaging/message-cleaner/listeners/messaging-message-cleaner-connected-account.listener';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  providers: [
    MessagingMessageCleanerService,
    MessagingConnectedAccountDeletionCleanupJob,
    MessagingMessageCleanerConnectedAccountListener,
    MessagingMessageCleanerRemoveOrphansCommand,
  ],
  exports: [MessagingMessageCleanerService],
})
export class MessagingMessageCleanerModule {}
