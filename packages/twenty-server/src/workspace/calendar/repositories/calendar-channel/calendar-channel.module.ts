import { Module } from '@nestjs/common';

import { CalendarChannelService } from 'src/workspace/calendar/repositories/calendar-channel/calendar-channel.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarChannelService],
  exports: [CalendarChannelService],
})
export class CalendarChannelModule {}
