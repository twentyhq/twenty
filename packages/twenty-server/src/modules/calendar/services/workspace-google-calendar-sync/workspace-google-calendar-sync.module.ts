import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceGoogleCalendarSyncService } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.service';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([CalendarChannelObjectMetadata]),
  ],
  providers: [WorkspaceGoogleCalendarSyncService],
  exports: [WorkspaceGoogleCalendarSyncService],
})
export class WorkspaceGoogleCalendarSyncModule {}
