import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingMessageCleanerRemoveOrphansCommand } from 'src/modules/messaging/message-cleaner/commands/messaging-message-clearner-remove-orphans.command';
import { MessagingResetChannelCommand } from 'src/modules/messaging/message-cleaner/commands/messaging-reset-channel.command';
import { MessagingConnectedAccountDeletionCleanupJob } from 'src/modules/messaging/message-cleaner/jobs/messaging-connected-account-deletion-cleanup.job';
import { MessagingMessageChannelDeletionCleanupJob } from 'src/modules/messaging/message-cleaner/jobs/messaging-message-channel-deletion-cleanup.job';
import { MessagingMessageCleanerConnectedAccountListener } from 'src/modules/messaging/message-cleaner/listeners/messaging-message-cleaner-connected-account.listener';
import { MessagingMessageCleanerMessageChannelListener } from 'src/modules/messaging/message-cleaner/listeners/messaging-message-cleaner-message-channel.listener';

import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    FeatureFlagModule,
    MessagingCommonModule,
    TypeOrmModule.forFeature([MessageChannelEntity]),
    WorkspaceIteratorModule,
  ],
  providers: [
    MessagingConnectedAccountDeletionCleanupJob,
    MessagingMessageChannelDeletionCleanupJob,
    MessagingMessageCleanerConnectedAccountListener,
    MessagingMessageCleanerMessageChannelListener,
    MessagingMessageCleanerRemoveOrphansCommand,
    MessagingResetChannelCommand,
    MessagingMessageCleanerService,
  ],
  exports: [MessagingMessageCleanerService],
})
export class MessagingMessageCleanerModule {}
