import { Module } from '@nestjs/common';

import { CalendarChannelEventAssociationService } from 'src/workspace/calendar/repositories/calendar-channel-event-association/calendar-channel-event-association.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarChannelEventAssociationService],
  exports: [CalendarChannelEventAssociationService],
})
export class CalendarChannelEventAssociationModule {}
