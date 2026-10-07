import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CalendarEventParticipantMatchParticipantJob } from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-match-participant.job';
import { CalendarEventParticipantPersonListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant-person.listener';
import { CalendarEventParticipantWorkspaceMemberListener } from 'src/modules/calendar/calendar-event-participant-manager/listeners/calendar-event-participant-workspace-member.listener';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { MatchParticipantModule } from 'src/modules/match-participant/match-participant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
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
