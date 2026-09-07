import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CalendarEventParticipantMatchParticipantJob } from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-match-participant.job';
import { CalendarEventParticipantPersonListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant-person.listener';
import { CalendarEventParticipantWorkspaceMemberListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant-workspace-member.listener';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { ContactCreationManagerModule } from 'src/modules/contact-creation-manager/contact-creation-manager.module';
import { MatchParticipantModule } from 'src/modules/match-participant/match-participant.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    ContactCreationManagerModule,
    MatchParticipantModule,
  ],
  providers: [
    CalendarEventParticipantService,
    CalendarEventParticipantMatchParticipantJob,
    CalendarEventParticipantPersonListener,
    CalendarEventParticipantWorkspaceMemberListener,
  ],
  exports: [CalendarEventParticipantService],
})
export class CalendarEventParticipantManagerModule {}
