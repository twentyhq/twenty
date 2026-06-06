import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { CalendarEventRecordingPolicyJob } from 'src/modules/calendar/calendar-event-recording-manager/jobs/calendar-event-recording-policy.job';
import { type CalendarEventRecordingPolicyJobData } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-job-data.type';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

// Participant matching is asynchronous, and AUTO depends on external participants.
const WORKSPACE_MEMBER_RELATION_FIELD = 'workspaceMember';

@Injectable()
export class CalendarEventRecordingParticipantListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('calendarEventParticipant', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<CalendarEventParticipantWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.enqueueParentPolicyCheck(
      payload.workspaceId,
      payload.events.map((event) => event.properties.after.calendarEventId),
    );
  }

  @OnDatabaseBatchEvent('calendarEventParticipant', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<CalendarEventParticipantWorkspaceEntity>
    >,
  ): Promise<void> {
    const calendarEventIds = payload.events
      .filter((event) =>
        (event.properties.updatedFields ?? []).includes(
          WORKSPACE_MEMBER_RELATION_FIELD,
        ),
      )
      .map((event) => event.properties.after.calendarEventId);

    await this.enqueueParentPolicyCheck(payload.workspaceId, calendarEventIds);
  }

  @OnDatabaseBatchEvent('calendarEventParticipant', DatabaseEventAction.DELETED)
  async handleDeletedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<CalendarEventParticipantWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.enqueueParentPolicyCheck(
      payload.workspaceId,
      payload.events.map((event) => event.properties.before.calendarEventId),
    );
  }

  @OnDatabaseBatchEvent(
    'calendarEventParticipant',
    DatabaseEventAction.DESTROYED,
  )
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<CalendarEventParticipantWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.enqueueParentPolicyCheck(
      payload.workspaceId,
      payload.events.map((event) => event.properties.before.calendarEventId),
    );
  }

  private async enqueueParentPolicyCheck(
    workspaceId: string,
    calendarEventIds: (string | null | undefined)[],
  ): Promise<void> {
    const definedCalendarEventIds = [
      ...new Set(calendarEventIds.filter(isDefined)),
    ];

    if (definedCalendarEventIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<CalendarEventRecordingPolicyJobData>(
      CalendarEventRecordingPolicyJob.name,
      {
        workspaceId,
        calendarEventIds: definedCalendarEventIds,
        removedOccurrences: [],
      },
    );
  }
}
