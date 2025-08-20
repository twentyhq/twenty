import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { type ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { type ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  MessageParticipantMatchParticipantJob,
  type MessageParticipantMatchParticipantJobData,
} from 'src/modules/messaging/message-participant-manager/jobs/message-participant-match-participant.job';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class MessageParticipantPersonListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
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
        isDefined(eventPayload.properties.after.emails?.primaryEmail) ||
        isDefined(eventPayload.properties.after.emails?.additionalEmails),
    );

    const personIds = personWithEmails.map(
      (eventPayload) => eventPayload.recordId,
    );
    const personEmails = personWithEmails
      .flatMap((eventPayload) => [
        eventPayload.properties.after.emails.primaryEmail,
        ...((eventPayload.properties.after.emails?.additionalEmails ??
          []) as string[]),
      ])
      .filter(isDefined);

    await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
      MessageParticipantMatchParticipantJob.name,
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
    const personWithEmails = payload.events.filter((eventPayload) =>
      objectRecordUpdateEventChangedProperties(
        eventPayload.properties.before,
        eventPayload.properties.after,
      ).includes('emails'),
    );

    const personIds = personWithEmails.map(
      (eventPayload) => eventPayload.recordId,
    );
    const personEmails = personWithEmails
      .flatMap((eventPayload) => [
        eventPayload.properties.after.emails.primaryEmail,
        ...((eventPayload.properties.after.emails?.additionalEmails ??
          []) as string[]),
      ])
      .filter(isDefined);

    await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
      MessageParticipantMatchParticipantJob.name,
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
    const personWithEmails = payload.events.filter(
      (eventPayload) =>
        isDefined(eventPayload.properties.before.emails?.primaryEmail) ||
        isDefined(eventPayload.properties.before.emails?.additionalEmails),
    );

    await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
      MessageParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        participantMatching: {
          personIds: [],
          personEmails: personWithEmails
            .flatMap((eventPayload) => [
              eventPayload.properties.before.emails.primaryEmail,
              ...((eventPayload.properties.before.emails?.additionalEmails ??
                []) as string[]),
            ])
            .filter(isDefined),
          workspaceMemberIds: [],
        },
      },
    );
  }
}
