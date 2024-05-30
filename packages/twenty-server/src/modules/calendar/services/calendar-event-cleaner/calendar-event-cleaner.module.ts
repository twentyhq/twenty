import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([CalendarEventWorkspaceEntity]),
  ],
  providers: [CalendarEventCleanerService],
  exports: [CalendarEventCleanerService],
})
export class CalendarEventCleanerModule {}
