import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingMessageChannelSyncStatusMonitoringCronCommand } from 'src/modules/messaging/monitoring/crons/commands/messaging-message-channel-sync-status-monitoring.cron.command';
import { MessagingMessageChannelSyncStatusMonitoringCronJob } from 'src/modules/messaging/monitoring/crons/jobs/messaging-message-channel-sync-status-monitoring.cron.job';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity, MessageChannelEntity])],
  providers: [
    MessagingMessageChannelSyncStatusMonitoringCronCommand,
    MessagingMessageChannelSyncStatusMonitoringCronJob,
    MessagingMonitoringService,
  ],
  exports: [MessagingMonitoringService],
})
export class MessagingMonitoringModule {}
