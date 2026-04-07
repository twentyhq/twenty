import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([
      CalendarChannelEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
    ConnectedAccountModule,
    MetricsModule,
  ],
  providers: [CalendarChannelSyncStatusService],
  exports: [CalendarChannelSyncStatusService],
})
export class CalendarCommonModule {}
