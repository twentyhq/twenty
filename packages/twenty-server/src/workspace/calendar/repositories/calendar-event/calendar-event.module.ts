import { Module } from '@nestjs/common';

import { CalendarEventService } from 'src/workspace/calendar/repositories/calendar-event/calendar-event.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarEventService],
  exports: [CalendarEventService],
})
export class CalendarEventModule {}
