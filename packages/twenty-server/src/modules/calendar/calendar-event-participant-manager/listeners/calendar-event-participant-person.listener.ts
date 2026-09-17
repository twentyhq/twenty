import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import {
  CalendarEventParticipantMatchParticipantJob,
  type CalendarEventParticipantMatchParticipantJobData,
} from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-match-participant.job';
import { getPersonEmails } from 'src/modules/match-participant/utils/get-person-emails.util';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class CalendarEventParticipantPersonListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('person', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<PersonWorkspaceEntity>
    >,
  ) {
    const personWithEmails = payload.events.filter(
      (eventPayload) =>
        getPersonEmails(eventPayload.properties.after.emails).length > 0,
    );

    if (personWithEmails.length === 0) {
      return;
    }

    const personIds = personWithEmails.map(
      (eventPayload) => eventPayload.recordId,
    );
    const personEmails = personWithEmails.flatMap((eventPayload) =>
      getPersonEmails(eventPayload.properties.after.emails),
    );

    await this.messageQueueService.add<CalendarEventParticipantMatchParticipantJobData>(
      CalendarEventParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        participantMatching: {
          personIds,
          personEmails,
          workspaceMemberIds: [],
        },
      },
    );
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<PersonWorkspaceEntity>
    >,
  ) {
    const personWithUpdatedEmails = payload.events.filter((eventPayload) =>
      objectRecordUpdateEventChangedProperties(
        eventPayload.properties.before,
        eventPayload.properties.after,
      ).includes('emails'),
    );

    if (personWithUpdatedEmails.length === 0) {
      return;
    }

    const personIds = personWithUpdatedEmails.map(
      (eventPayload) => eventPayload.recordId,
    );
    const personEmails = personWithUpdatedEmails.flatMap((eventPayload) =>
      getPersonEmails(eventPayload.properties.after.emails),
    );

    await this.messageQueueService.add<CalendarEventParticipantMatchParticipantJobData>(
      CalendarEventParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        participantMatching: {
          personIds,
          personEmails,
          workspaceMemberIds: [],
        },
      },
    );
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<PersonWorkspaceEntity>
    >,
  ) {
    const personEmails = payload.events.flatMap((eventPayload) =>
      getPersonEmails(eventPayload.properties.before.emails),
    );

    if (personEmails.length === 0) {
      return;
    }

    await this.messageQueueService.add<CalendarEventParticipantMatchParticipantJobData>(
      CalendarEventParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        participantMatching: {
          personIds: [],
          personEmails,
          workspaceMemberIds: [],
        },
      },
    );
  }
}
