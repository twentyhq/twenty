import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingMessageCleanerRemoveOrphansCommand } from 'src/modules/messaging/message-cleaner/commands/messaging-message-clearner-remove-orphans.command';
import { MessagingResetChannelCommand } from 'src/modules/messaging/message-cleaner/commands/messaging-reset-channel.command';
import { MessagingConnectedAccountDeletionCleanupJob } from 'src/modules/messaging/message-cleaner/jobs/messaging-connected-account-deletion-cleanup.job';
import { MessagingMessageCleanerConnectedAccountListener } from 'src/modules/messaging/message-cleaner/listeners/messaging-message-cleaner-connected-account.listener';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    MessagingCommonModule,
  ],
  providers: [
    MessagingConnectedAccountDeletionCleanupJob,
    MessagingMessageCleanerConnectedAccountListener,
    MessagingMessageCleanerRemoveOrphansCommand,
    MessagingResetChannelCommand,
    MessagingMessageCleanerService,
  ],
  exports: [MessagingMessageCleanerService],
})
export class MessagingMessageCleanerModule {}
