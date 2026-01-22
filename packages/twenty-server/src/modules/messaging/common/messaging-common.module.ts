import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([FeatureFlagEntity]),
    ConnectedAccountModule,
    MetricsModule,
  ],
  providers: [MessageChannelSyncStatusService],
  exports: [MessageChannelSyncStatusService],
})
export class MessagingCommonModule {}
