import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceGoogleCalendarSyncService } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.service';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([CalendarChannelWorkspaceEntity]),
  ],
  providers: [WorkspaceGoogleCalendarSyncService],
  exports: [WorkspaceGoogleCalendarSyncService],
})
export class WorkspaceGoogleCalendarSyncModule {}
