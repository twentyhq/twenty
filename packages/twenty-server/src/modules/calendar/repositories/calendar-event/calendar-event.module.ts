import { Module } from '@nestjs/common';

import { CalendarEventRepository } from 'src/modules/calendar/repositories/calendar-event/calendar-event.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarEventRepository],
  exports: [CalendarEventRepository],
})
export class CalendarEventModule {}
