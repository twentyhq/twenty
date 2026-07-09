import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
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
import { getPhoneHandlesFromPhones } from 'src/modules/match-participant/utils/get-phone-handles-from-phones';
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
    const peopleWithEmailsOrPhones = payload.events.filter(
      (eventPayload) =>
        isDefined(eventPayload.properties.after.emails?.primaryEmail) ||
        isDefined(eventPayload.properties.after.emails?.additionalEmails) ||
        isNonEmptyString(
          eventPayload.properties.after.phones?.primaryPhoneNumber,
        ),
    );

    const personIds = peopleWithEmailsOrPhones.map(
      (eventPayload) => eventPayload.recordId,
    );
    const personEmails = peopleWithEmailsOrPhones
      .flatMap((eventPayload) => [
        eventPayload.properties.after.emails?.primaryEmail,
        ...((eventPayload.properties.after.emails?.additionalEmails ??
          []) as string[]),
      ])
      .filter(isDefined);
    const personPhones = peopleWithEmailsOrPhones.flatMap((eventPayload) =>
      getPhoneHandlesFromPhones({
        phones: eventPayload.properties.after.phones,
      }),
    );

    await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
      MessageParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        participantMatching: {
          personIds,
          personEmails,
          personPhones,
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
    const peopleWithChangedEmailsOrPhones = payload.events.filter(
      (eventPayload) => {
        const changedProperties = objectRecordUpdateEventChangedProperties(
          eventPayload.properties.before,
          eventPayload.properties.after,
        );

        return (
          changedProperties.includes('emails') ||
          changedProperties.includes('phones')
        );
      },
    );

    const personIds = peopleWithChangedEmailsOrPhones.map(
      (eventPayload) => eventPayload.recordId,
    );
    const personEmails = peopleWithChangedEmailsOrPhones
      .flatMap((eventPayload) => [
        eventPayload.properties.after.emails?.primaryEmail,
        ...((eventPayload.properties.after.emails?.additionalEmails ??
          []) as string[]),
      ])
      .filter(isDefined);
    const personPhones = peopleWithChangedEmailsOrPhones.flatMap(
      (eventPayload) =>
        getPhoneHandlesFromPhones({
          phones: eventPayload.properties.after.phones,
        }),
    );

    await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
      MessageParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        participantMatching: {
          personIds,
          personEmails,
          personPhones,
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
    const peopleWithEmailsOrPhones = payload.events.filter(
      (eventPayload) =>
        isDefined(eventPayload.properties.before.emails?.primaryEmail) ||
        isDefined(eventPayload.properties.before.emails?.additionalEmails) ||
        isNonEmptyString(
          eventPayload.properties.before.phones?.primaryPhoneNumber,
        ),
    );

    await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
      MessageParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        participantMatching: {
          personIds: [],
          personEmails: peopleWithEmailsOrPhones
            .flatMap((eventPayload) => [
              eventPayload.properties.before.emails?.primaryEmail,
              ...((eventPayload.properties.before.emails?.additionalEmails ??
                []) as string[]),
            ])
            .filter(isDefined),
          personPhones: peopleWithEmailsOrPhones.flatMap((eventPayload) =>
            getPhoneHandlesFromPhones({
              phones: eventPayload.properties.before.phones,
            }),
          ),
          workspaceMemberIds: [],
        },
      },
    );
  }
}
