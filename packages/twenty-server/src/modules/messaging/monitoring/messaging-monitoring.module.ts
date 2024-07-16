import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingMessageChannelSyncStatusMonitoringCronCommand } from 'src/modules/messaging/monitoring/crons/commands/messaging-message-channel-sync-status-monitoring.cron.command';
import { MessagingMessageChannelSyncStatusMonitoringCronJob } from 'src/modules/messaging/monitoring/crons/jobs/messaging-message-channel-sync-status-monitoring.cron';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';

@Module({
  imports: [
    MessagingCommonModule,
    BillingModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
  ],
  providers: [
    MessagingMessageChannelSyncStatusMonitoringCronCommand,
    MessagingMessageChannelSyncStatusMonitoringCronJob,
  ],
  exports: [],
})
export class MessagingMonitoringModule {}
