import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import {
  CalendarEventRecordingDecisionJob,
  type CalendarEventRecordingDecisionJobData,
} from 'src/modules/calendar/calendar-event-recording-manager/jobs/calendar-event-recording-decision.job';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

// Only these field changes can flip a recording decision, so other calendar-event updates are
// ignored to avoid re-evaluating on noise. conferenceLink is composite, hence the prefix match.
const RECORDING_RELEVANT_CALENDAR_EVENT_FIELDS = [
  'recordingPreference',
  'conferenceLink',
  'startsAt',
  'endsAt',
  'isCanceled',
  'iCalUid',
];

@Injectable()
export class CalendarEventRecordingListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('calendarEvent', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<CalendarEventWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.enqueueDecision(
      payload.workspaceId,
      payload.events.map((event) => event.recordId),
    );
  }

  @OnDatabaseBatchEvent('calendarEvent', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<CalendarEventWorkspaceEntity>
    >,
  ): Promise<void> {
    const calendarEventIds = payload.events
      .filter((event) =>
        hasRecordingRelevantFieldChange(event.properties.updatedFields),
      )
      .map((event) => event.recordId);

    await this.enqueueDecision(payload.workspaceId, calendarEventIds);
  }

  private async enqueueDecision(
    workspaceId: string,
    calendarEventIds: string[],
  ): Promise<void> {
    if (calendarEventIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<CalendarEventRecordingDecisionJobData>(
      CalendarEventRecordingDecisionJob.name,
      { workspaceId, calendarEventIds },
    );
  }
}

const hasRecordingRelevantFieldChange = (
  updatedFields: string[] | undefined,
): boolean =>
  (updatedFields ?? []).some((updatedField) =>
    RECORDING_RELEVANT_CALENDAR_EVENT_FIELDS.some(
      (relevantField) =>
        updatedField === relevantField ||
        updatedField.startsWith(relevantField),
    ),
  );
