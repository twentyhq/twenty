import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CalendarEventRecordingCheckPolicyCommand } from 'src/modules/calendar/calendar-event-recording-manager/commands/calendar-event-recording-check-policy.command';
import { CalendarEventRecordingPolicyJob } from 'src/modules/calendar/calendar-event-recording-manager/jobs/calendar-event-recording-policy.job';
import { CalendarEventRecordingListener } from 'src/modules/calendar/calendar-event-recording-manager/listeners/calendar-event-recording.listener';
import { CalendarEventRecordingParticipantListener } from 'src/modules/calendar/calendar-event-recording-manager/listeners/calendar-event-recording-participant.listener';
import { CalendarEventRecordingPolicyService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-policy.service';
import { CalendarEventRecordingReconciliationService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-reconciliation.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    CalendarEventRecordingPolicyService,
    CalendarEventRecordingReconciliationService,
    CalendarEventRecordingPolicyJob,
    CalendarEventRecordingListener,
    CalendarEventRecordingParticipantListener,
    CalendarEventRecordingCheckPolicyCommand,
  ],
  exports: [
    CalendarEventRecordingPolicyService,
    CalendarEventRecordingReconciliationService,
  ],
})
export class CalendarEventRecordingManagerModule {}
