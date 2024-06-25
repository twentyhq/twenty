import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceGoogleCalendarSyncService } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.service';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';

@Module({
  imports: [TwentyORMModule.forFeature([CalendarChannelWorkspaceEntity])],
  providers: [WorkspaceGoogleCalendarSyncService],
  exports: [WorkspaceGoogleCalendarSyncService],
})
export class WorkspaceGoogleCalendarSyncModule {}
