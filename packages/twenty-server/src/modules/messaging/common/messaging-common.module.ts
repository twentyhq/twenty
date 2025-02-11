import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([FeatureFlag], 'core'),
    ConnectedAccountModule,
    HealthModule,
  ],
  providers: [MessageChannelSyncStatusService],
  exports: [MessageChannelSyncStatusService],
})
export class MessagingCommonModule {}
