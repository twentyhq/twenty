import { Module } from '@nestjs/common';

import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association/calendar-channel-event-association.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarChannelEventAssociationRepository],
  exports: [CalendarChannelEventAssociationRepository],
})
export class CalendarChannelEventAssociationModule {}
