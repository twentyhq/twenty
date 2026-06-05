import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type RemovedRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording.types';
import { CalendarEventRecordingDecisionService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-decision.service';

export type CalendarEventRecordingDecisionJobData = {
  workspaceId: string;
  calendarEventIds: string[];
  removedOccurrences?: RemovedRecordingOccurrence[];
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventRecordingDecisionJob {
  private readonly logger = new Logger(CalendarEventRecordingDecisionJob.name);

  constructor(
    private readonly calendarEventRecordingDecisionService: CalendarEventRecordingDecisionService,
  ) {}

  @Process(CalendarEventRecordingDecisionJob.name)
  async handle({
    workspaceId,
    calendarEventIds,
    removedOccurrences,
  }: CalendarEventRecordingDecisionJobData): Promise<void> {
    const meetingAggregates =
      await this.calendarEventRecordingDecisionService.evaluateMeetingOccurrences(
        { workspaceId, calendarEventIds, removedOccurrences },
      );

    // No bot is dispatched yet; the per-meeting decision is only logged.
    for (const aggregate of meetingAggregates) {
      if (aggregate.providerIntent === 'ACTIVE') {
        this.logger.log(
          `would request bot for meeting ${aggregate.realMeetingKey} in workspace ${workspaceId} (calendar events: ${aggregate.activeCalendarEventIds.join(', ')})`,
        );
      } else {
        this.logger.log(
          `would cancel intent for meeting ${aggregate.realMeetingKey} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
