import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { DeleteConnectedAccountAssociatedCalendarDataJob } from 'src/modules/calendar/calendar-event-cleaner/jobs/delete-connected-account-associated-calendar-data.job';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@Module({
  imports: [TwentyORMModule.forFeature([CalendarEventWorkspaceEntity])],
  providers: [
    CalendarEventCleanerService,
    DeleteConnectedAccountAssociatedCalendarDataJob,
  ],
  exports: [CalendarEventCleanerService],
})
export class CalendarEventCleanerModule {}
