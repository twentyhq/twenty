import { Module } from '@nestjs/common';

import { CalendarBlocklistManagerModule } from 'src/modules/calendar/blocklist-manager/calendar-blocklist-manager.module';
import { CalendarEventCleanerModule } from 'src/modules/calendar/calendar-event-cleaner/calendar-event-cleaner.module';
import { CalendarEventImportManagerModule } from 'src/modules/calendar/calendar-event-import-manager/calendar-event-import-manager.module';
import { CalendarEventParticipantManagerModule } from 'src/modules/calendar/calendar-event-participant-manager/calendar-event-participant-manager.module';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';

@Module({
  imports: [
    CalendarBlocklistManagerModule,
    CalendarEventCleanerModule,
    CalendarEventImportManagerModule,
    CalendarEventParticipantManagerModule,
    CalendarCommonModule,
  ],
  providers: [],
  exports: [],
})
export class CalendarModule {}
