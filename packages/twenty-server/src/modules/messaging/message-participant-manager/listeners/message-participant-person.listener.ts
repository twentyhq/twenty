import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { PersonHandleFieldService } from 'src/modules/match-participant/person-handle-field/person-handle-field.service';
import { getChangedPersonHandles } from 'src/modules/match-participant/person-handle-field/utils/get-changed-person-handles.util';
import { getPersonEmails } from 'src/modules/match-participant/utils/get-person-emails.util';
import {
  MessageParticipantMatchParticipantJob,
  type MessageParticipantMatchParticipantJobData,
  type PersonHandleMatching,
} from 'src/modules/messaging/message-participant-manager/jobs/message-participant-match-participant.job';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class MessageParticipantPersonListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly personHandleFieldService: PersonHandleFieldService,
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

    const personHandleMatching = await this.buildPersonHandleMatching({
      workspaceId: payload.workspaceId,
      personChanges: payload.events.map((eventPayload) => ({
        personId: eventPayload.recordId,
        before: null,
        after: eventPayload.properties.after,
      })),
    });

    await this.enqueueMatching({
      workspaceId: payload.workspaceId,
      participantMatching: {
        personEmails: personWithEmails.flatMap((eventPayload) =>
          getPersonEmails(eventPayload.properties.after.emails),
        ),
        workspaceMemberIds: [],
      },
      personHandleMatching,
    });
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<PersonWorkspaceEntity>
    >,
  ) {
    const personChanges = payload.events.map((eventPayload) => ({
      personId: eventPayload.recordId,
      before: eventPayload.properties.before,
      after: eventPayload.properties.after,
      changedFieldNames: objectRecordUpdateEventChangedProperties(
        eventPayload.properties.before,
        eventPayload.properties.after,
      ),
    }));

    const personHandleMatching = await this.buildPersonHandleMatching({
      workspaceId: payload.workspaceId,
      personChanges,
    });

    await this.enqueueMatching({
      workspaceId: payload.workspaceId,
      participantMatching: {
        personEmails: personChanges
          .filter(({ changedFieldNames }) =>
            changedFieldNames.includes('emails'),
          )
          .flatMap(({ before, after }) => [
            ...getPersonEmails(before.emails),
            ...getPersonEmails(after.emails),
          ]),
        workspaceMemberIds: [],
      },
      personHandleMatching,
    });
  }

  private async enqueueMatching(
    data: MessageParticipantMatchParticipantJobData,
  ): Promise<void> {
    if (
      data.participantMatching.personEmails.length === 0 &&
      (data.personHandleMatching ?? []).length === 0
    ) {
      return;
    }

    await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
      MessageParticipantMatchParticipantJob.name,
      data,
    );
  }

  private async buildPersonHandleMatching({
    workspaceId,
    personChanges,
  }: {
    workspaceId: string;
    personChanges: {
      personId: string;
      before: PersonWorkspaceEntity | null;
      after: PersonWorkspaceEntity | null;
      changedFieldNames?: string[];
    }[];
  }): Promise<PersonHandleMatching[]> {
    const changedHandlesByFieldUniversalIdentifier = new Map<
      string,
      { handles: string[]; changedPersonIds: string[] }
    >();

    for (const personHandleField of await this.personHandleFieldService.findAll(
      workspaceId,
    )) {
      const changedHandles = getChangedPersonHandles({
        personHandleField,
        personChanges: personChanges.filter(
          ({ changedFieldNames }) =>
            !isDefined(changedFieldNames) ||
            changedFieldNames.includes(personHandleField.name),
        ),
      });

      if (changedHandles.handles.length > 0) {
        changedHandlesByFieldUniversalIdentifier.set(
          personHandleField.universalIdentifier,
          changedHandles,
        );
      }
    }

    // most person writes stop here, before any channel lookup
    if (changedHandlesByFieldUniversalIdentifier.size === 0) {
      return [];
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: {
        workspaceId,
        type: MessageChannelType.APP,
        participantHandleFieldUniversalIdentifier: In([
          ...changedHandlesByFieldUniversalIdentifier.keys(),
        ]),
      },
      select: { id: true, participantHandleFieldUniversalIdentifier: true },
    });

    return [...changedHandlesByFieldUniversalIdentifier].flatMap(
      ([fieldUniversalIdentifier, { handles, changedPersonIds }]) => {
        const messageChannelIds = messageChannels
          .filter(
            (messageChannel) =>
              messageChannel.participantHandleFieldUniversalIdentifier ===
              fieldUniversalIdentifier,
          )
          .map((messageChannel) => messageChannel.id);

        if (messageChannelIds.length === 0) {
          return [];
        }

        return [
          {
            fieldUniversalIdentifier,
            messageChannelIds,
            handles,
            changedPersonIds,
          },
        ];
      },
    );
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<PersonWorkspaceEntity>
    >,
  ) {
    const personHandleMatching = await this.buildPersonHandleMatching({
      workspaceId: payload.workspaceId,
      personChanges: payload.events.map((eventPayload) => ({
        personId: eventPayload.recordId,
        before: eventPayload.properties.before,
        after: null,
      })),
    });

    await this.enqueueMatching({
      workspaceId: payload.workspaceId,
      participantMatching: {
        personEmails: payload.events.flatMap((eventPayload) =>
          getPersonEmails(eventPayload.properties.before.emails),
        ),
        workspaceMemberIds: [],
      },
      personHandleMatching,
    });
  }
}
