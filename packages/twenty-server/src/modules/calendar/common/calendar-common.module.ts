import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([FeatureFlag], 'core'),
    ConnectedAccountModule,
    HealthModule,
  ],
  providers: [CalendarChannelSyncStatusService],
  exports: [CalendarChannelSyncStatusService],
})
export class CalendarCommonModule {}
