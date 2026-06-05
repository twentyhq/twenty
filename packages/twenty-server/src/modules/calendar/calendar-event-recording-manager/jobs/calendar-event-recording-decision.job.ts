import { Logger, Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventRecordingDecisionService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-decision.service';
import {
  aggregateRecordingIntentByMeeting,
  type CalendarEventRecordingIntentForMeeting,
} from 'src/modules/calendar/calendar-event-recording-manager/utils/aggregate-recording-intent-by-meeting.util';

export type CalendarEventRecordingDecisionJobData = {
  workspaceId: string;
  calendarEventIds: string[];
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
  }: CalendarEventRecordingDecisionJobData): Promise<void> {
    const perEventIntents: CalendarEventRecordingIntentForMeeting[] = [];

    for (const calendarEventId of calendarEventIds) {
      const decision =
        await this.calendarEventRecordingDecisionService.evaluateCalendarEvent({
          workspaceId,
          calendarEventId,
        });

      if (
        !decision.found ||
        !isDefined(decision.realMeetingKey) ||
        !isDefined(decision.eventIntent)
      ) {
        continue;
      }

      perEventIntents.push({
        calendarEventId: decision.calendarEventId,
        realMeetingKey: decision.realMeetingKey,
        eventIntent: decision.eventIntent,
      });
    }

    // Bot scheduling/cancellation is the provider-dispatch PR's job; here we only log the
    // decision the dispatcher would act on, keyed by the deduped real meeting.
    for (const aggregate of aggregateRecordingIntentByMeeting(
      perEventIntents,
    )) {
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
