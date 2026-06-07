import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { CalendarEventRecordingPolicyJob } from 'src/modules/calendar/calendar-event-recording-manager/jobs/calendar-event-recording-policy.job';
import { type CalendarEventRecordingPolicyJobData } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-job-data.type';
import { type RemovedCalendarEventRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-calendar-event-recording-occurrence.type';
import { computeRealMeetingKey } from 'src/modules/calendar/calendar-event-recording-manager/utils/compute-real-meeting-key.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const RECORDING_RELEVANT_CALENDAR_EVENT_FIELDS = [
  'title',
  'recordingPreference',
  'conferenceLink',
  'startsAt',
  'endsAt',
  'isCanceled',
  'iCalUid',
];

const RECORDING_KEY_CALENDAR_EVENT_FIELDS = [
  'conferenceLink',
  'startsAt',
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
    await this.enqueuePolicyCheck({
      workspaceId: payload.workspaceId,
      calendarEventIds: payload.events.map((event) => event.recordId),
    });
  }

  @OnDatabaseBatchEvent('calendarEvent', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<CalendarEventWorkspaceEntity>
    >,
  ): Promise<void> {
    const recordingRelevantEvents = payload.events.filter((event) =>
      hasRecordingRelevantFieldChange(event.properties.updatedFields),
    );
    const calendarEventIds = recordingRelevantEvents.map(
      (event) => event.recordId,
    );
    const removedOccurrences = recordingRelevantEvents
      .filter((event) =>
        hasRecordingKeyFieldChange(event.properties.updatedFields),
      )
      .map((event) => buildRemovedOccurrence(event.properties.before));

    await this.enqueuePolicyCheck({
      workspaceId: payload.workspaceId,
      calendarEventIds,
      removedOccurrences,
    });
  }

  @OnDatabaseBatchEvent('calendarEvent', DatabaseEventAction.DELETED)
  async handleDeletedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<CalendarEventWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.enqueuePolicyCheck({
      workspaceId: payload.workspaceId,
      calendarEventIds: [],
      removedOccurrences: payload.events.map((event) =>
        buildRemovedOccurrence(event.properties.before),
      ),
    });
  }

  @OnDatabaseBatchEvent('calendarEvent', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<CalendarEventWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.enqueuePolicyCheck({
      workspaceId: payload.workspaceId,
      calendarEventIds: [],
      removedOccurrences: payload.events.map((event) =>
        buildRemovedOccurrence(event.properties.before),
      ),
    });
  }

  private async enqueuePolicyCheck({
    workspaceId,
    calendarEventIds,
    removedOccurrences = [],
  }: {
    workspaceId: string;
    calendarEventIds: string[];
    removedOccurrences?: RemovedCalendarEventRecordingOccurrence[];
  }): Promise<void> {
    if (calendarEventIds.length === 0 && removedOccurrences.length === 0) {
      return;
    }

    await this.messageQueueService.add<CalendarEventRecordingPolicyJobData>(
      CalendarEventRecordingPolicyJob.name,
      { workspaceId, calendarEventIds, removedOccurrences },
    );
  }
}

const hasRecordingRelevantFieldChange = (
  updatedFields: string[] | undefined,
): boolean =>
  (updatedFields ?? []).some((updatedField) =>
    RECORDING_RELEVANT_CALENDAR_EVENT_FIELDS.includes(updatedField),
  );

const hasRecordingKeyFieldChange = (
  updatedFields: string[] | undefined,
): boolean =>
  (updatedFields ?? []).some((updatedField) =>
    RECORDING_KEY_CALENDAR_EVENT_FIELDS.includes(updatedField),
  );

const buildRemovedOccurrence = (
  calendarEvent: CalendarEventWorkspaceEntity,
): RemovedCalendarEventRecordingOccurrence => ({
  calendarEventId: calendarEvent.id,
  realMeetingKey: computeRealMeetingKey({
    calendarEventId: calendarEvent.id,
    conferenceLinkUrl: calendarEvent.conferenceLink?.primaryLinkUrl ?? null,
    iCalUid: calendarEvent.iCalUid,
    startsAt: calendarEvent.startsAt,
  }),
  startsAt: calendarEvent.startsAt,
});
