import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventRecordingPolicyService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-policy.service';
import { CalendarEventRecordingReconciliationService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-reconciliation.service';
import { type CalendarEventRecordingPolicyJobData } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-job-data.type';

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventRecordingPolicyJob {
  private readonly logger = new Logger(CalendarEventRecordingPolicyJob.name);

  constructor(
    private readonly calendarEventRecordingPolicyService: CalendarEventRecordingPolicyService,
    private readonly calendarEventRecordingReconciliationService: CalendarEventRecordingReconciliationService,
  ) {}

  @Process(CalendarEventRecordingPolicyJob.name)
  async handle({
    workspaceId,
    calendarEventIds,
    removedOccurrences,
  }: CalendarEventRecordingPolicyJobData): Promise<void> {
    const meetingPolicyResults =
      await this.calendarEventRecordingPolicyService.resolveMeetingPolicyResults(
        { workspaceId, calendarEventIds, removedOccurrences },
      );

    const reconciliationResults =
      await this.calendarEventRecordingReconciliationService.reconcileMeetingOccurrences(
        { workspaceId, meetingPolicyResults, removedOccurrences },
      );

    for (const reconciliationResult of reconciliationResults) {
      this.logger.log(
        `${reconciliationResult.action.toLowerCase()} call recording lifecycle in workspace ${workspaceId} with callRecordingId ${reconciliationResult.callRecordingId ?? 'none'}`,
      );
    }
  }
}
