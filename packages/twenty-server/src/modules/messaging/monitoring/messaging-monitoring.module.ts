import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingMessageChannelSyncStatusMonitoringCronCommand } from 'src/modules/messaging/monitoring/crons/commands/messaging-message-channel-sync-status-monitoring.cron.command';
import { MessagingMessageChannelSyncStatusMonitoringCronJob } from 'src/modules/messaging/monitoring/crons/jobs/messaging-message-channel-sync-status-monitoring.cron.job';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

@Module({
  imports: [
    AuditModule,
    MessagingCommonModule,
    BillingModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
  ],
  providers: [
    MessagingMessageChannelSyncStatusMonitoringCronCommand,
    MessagingMessageChannelSyncStatusMonitoringCronJob,
    MessagingMonitoringService,
  ],
  exports: [MessagingMonitoringService],
})
export class MessagingMonitoringModule {}
