import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type RemovedCalendarEventRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-calendar-event-recording-occurrence.type';
import { CalendarEventRecordingDecisionService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-decision.service';
import { CalendarEventRecordingReconciliationService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-reconciliation.service';

export type CalendarEventRecordingDecisionJobData = {
  workspaceId: string;
  calendarEventIds: string[];
  removedOccurrences?: RemovedCalendarEventRecordingOccurrence[];
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventRecordingDecisionJob {
  private readonly logger = new Logger(CalendarEventRecordingDecisionJob.name);

  constructor(
    private readonly calendarEventRecordingDecisionService: CalendarEventRecordingDecisionService,
    private readonly calendarEventRecordingReconciliationService: CalendarEventRecordingReconciliationService,
  ) {}

  @Process(CalendarEventRecordingDecisionJob.name)
  async handle({
    workspaceId,
    calendarEventIds,
    removedOccurrences,
  }: CalendarEventRecordingDecisionJobData): Promise<void> {
    const meetingDecisions =
      await this.calendarEventRecordingDecisionService.evaluateMeetingOccurrences(
        { workspaceId, calendarEventIds, removedOccurrences },
      );

    const reconciliationResults =
      await this.calendarEventRecordingReconciliationService.reconcileMeetingOccurrences(
        { workspaceId, meetingDecisions, removedOccurrences },
      );

    for (const reconciliationResult of reconciliationResults) {
      this.logger.log(
        `${reconciliationResult.action.toLowerCase()} call recording lifecycle in workspace ${workspaceId} with callRecordingId ${reconciliationResult.callRecordingId ?? 'none'}`,
      );
    }
  }
}
