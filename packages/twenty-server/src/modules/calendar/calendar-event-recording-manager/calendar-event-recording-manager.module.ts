import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CalendarEventRecordingEvaluateCommand } from 'src/modules/calendar/calendar-event-recording-manager/commands/calendar-event-recording-evaluate.command';
import { CalendarEventRecordingDecisionJob } from 'src/modules/calendar/calendar-event-recording-manager/jobs/calendar-event-recording-decision.job';
import { CalendarEventRecordingListener } from 'src/modules/calendar/calendar-event-recording-manager/listeners/calendar-event-recording.listener';
import { CalendarEventRecordingDecisionService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-decision.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    CalendarEventRecordingDecisionService,
    CalendarEventRecordingDecisionJob,
    CalendarEventRecordingListener,
    CalendarEventRecordingEvaluateCommand,
  ],
  exports: [CalendarEventRecordingDecisionService],
})
export class CalendarEventRecordingManagerModule {}
