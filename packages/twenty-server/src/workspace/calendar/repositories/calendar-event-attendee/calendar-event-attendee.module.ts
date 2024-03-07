import { Module } from '@nestjs/common';

import { CalendarEventAttendeesService } from 'src/workspace/calendar/repositories/calendar-event-attendee/calendar-event-attendee.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarEventAttendeesService],
  exports: [CalendarEventAttendeesService],
})
export class CalendarEventAttendeesModule {}
