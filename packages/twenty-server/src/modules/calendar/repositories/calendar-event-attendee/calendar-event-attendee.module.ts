import { Module } from '@nestjs/common';

import { CalendarEventAttendeeRepository } from 'src/modules/calendar/repositories/calendar-event-attendee/calendar-event-attendee.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarEventAttendeeRepository],
  exports: [CalendarEventAttendeeRepository],
})
export class CalendarEventAttendeeModule {}
