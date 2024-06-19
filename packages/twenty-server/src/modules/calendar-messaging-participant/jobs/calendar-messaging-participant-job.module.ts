import { Module } from '@nestjs/common';

import { MatchParticipantJob } from 'src/modules/calendar-messaging-participant/jobs/match-participant.job';
import { UnmatchParticipantJob } from 'src/modules/calendar-messaging-participant/jobs/unmatch-participant.job';
import { CalendarEventParticipantModule } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';

@Module({
  imports: [CalendarEventParticipantModule, MessagingCommonModule],
  providers: [MatchParticipantJob, UnmatchParticipantJob],
})
export class CalendarMessagingParticipantJobModule {}
