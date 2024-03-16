import { Module } from '@nestjs/common';

import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel/calendar-channel.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarChannelRepository],
  exports: [CalendarChannelRepository],
})
export class CalendarChannelModule {}
