import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { CalendarEventModule } from 'src/workspace/calendar/repositories/calendar-event/calendar-event.module';
import { CalendarEventCleanerService } from 'src/workspace/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';

@Module({
  imports: [DataSourceModule, TypeORMModule, CalendarEventModule],
  providers: [CalendarEventCleanerService],
  exports: [CalendarEventCleanerService],
})
export class CalendarEventCleanerModule {}
