import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([FeatureFlagEntity]),
    ConnectedAccountModule,
    MetricsModule,
  ],
  providers: [CalendarChannelSyncStatusService],
  exports: [CalendarChannelSyncStatusService],
})
export class CalendarCommonModule {}
