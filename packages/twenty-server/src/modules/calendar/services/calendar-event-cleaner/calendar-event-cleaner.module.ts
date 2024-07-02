import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';

@Module({
  imports: [TwentyORMModule.forFeature([CalendarEventWorkspaceEntity])],
  providers: [CalendarEventCleanerService],
  exports: [CalendarEventCleanerService],
})
export class CalendarEventCleanerModule {}
