import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AddPersonIdAndWorkspaceMemberIdService } from 'src/modules/calendar-messaging-participant-manager/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { CalendarEventParticipantService } from 'src/modules/calendar/common/services/calendar-event-participant.service';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [
    CalendarEventParticipantService,
    CalendarChannelSyncStatusService,
    AddPersonIdAndWorkspaceMemberIdService,
  ],
  exports: [CalendarEventParticipantService, CalendarChannelSyncStatusService],
})
export class CalendarCommonModule {}
