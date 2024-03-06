import { Module } from '@nestjs/common';

import { CalendarChannelEventAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarChannelEventAssociationService],
  exports: [CalendarChannelEventAssociationService],
})
export class CalendarChannelEventAssociationModule {}
