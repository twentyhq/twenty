import { Module } from '@nestjs/common';

import { MatchParticipantJob } from 'src/modules/calendar-messaging-participant/jobs/match-participant.job';
import { UnmatchParticipantJob } from 'src/modules/calendar-messaging-participant/jobs/unmatch-participant.job';
import { CalendarEventParticipantModule } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.module';
import { MessageParticipantModule } from 'src/modules/messaging/services/message-participant/message-participant.module';

@Module({
  imports: [MessageParticipantModule, CalendarEventParticipantModule],
  providers: [
    {
      provide: MatchParticipantJob.name,
      useClass: MatchParticipantJob,
    },
    {
      provide: UnmatchParticipantJob.name,
      useClass: UnmatchParticipantJob,
    },
  ],
})
export class CalendarMessagingParticipantJobModule {}
