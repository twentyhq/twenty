import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { PersonHandleFieldService } from 'src/modules/match-participant/person-handle-field/person-handle-field.service';
import { getCanonicalPersonHandles } from 'src/modules/match-participant/person-handle-field/utils/get-canonical-person-handles.util';
import { getPersonFieldValue } from 'src/modules/match-participant/person-handle-field/utils/get-person-field-value.util';
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
    const personWithUpdatedEmails = payload.events.filter((eventPayload) =>
      objectRecordUpdateEventChangedProperties(
        eventPayload.properties.before,
        eventPayload.properties.after,
      ).includes('emails'),
    );

    const personHandleMatching = await this.buildPersonHandleMatching({
      workspaceId: payload.workspaceId,
      personChanges: payload.events.map((eventPayload) => ({
        before: eventPayload.properties.before,
        after: eventPayload.properties.after,
      })),
    });

    await this.enqueueMatching({
      workspaceId: payload.workspaceId,
      participantMatching: {
        personEmails: personWithUpdatedEmails.flatMap((eventPayload) => [
          ...getPersonEmails(eventPayload.properties.before.emails),
          ...getPersonEmails(eventPayload.properties.after.emails),
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

  // values before and after the change, so a value the person lost releases its participants too
  private async buildPersonHandleMatching({
    workspaceId,
    personChanges,
  }: {
    workspaceId: string;
    personChanges: {
      before: PersonWorkspaceEntity | null;
      after: PersonWorkspaceEntity;
    }[];
  }): Promise<PersonHandleMatching[]> {
    const messageChannels = await this.messageChannelRepository.find({
      where: {
        workspaceId,
        type: MessageChannelType.APP,
        participantHandleFieldUniversalIdentifier: Not(IsNull()),
      },
      select: { id: true, participantHandleFieldUniversalIdentifier: true },
    });

    const messageChannelIdsByFieldUniversalIdentifier = new Map<
      string,
      string[]
    >();

    for (const messageChannel of messageChannels) {
      const fieldUniversalIdentifier =
        messageChannel.participantHandleFieldUniversalIdentifier;

      if (!isDefined(fieldUniversalIdentifier)) {
        continue;
      }

      messageChannelIdsByFieldUniversalIdentifier.set(
        fieldUniversalIdentifier,
        [
          ...(messageChannelIdsByFieldUniversalIdentifier.get(
            fieldUniversalIdentifier,
          ) ?? []),
          messageChannel.id,
        ],
      );
    }

    const personHandleMatching: PersonHandleMatching[] = [];

    for (const [
      fieldUniversalIdentifier,
      messageChannelIds,
    ] of messageChannelIdsByFieldUniversalIdentifier) {
      const personHandleField =
        await this.personHandleFieldService.findByUniversalIdentifier({
          workspaceId,
          fieldUniversalIdentifier,
        });

      if (!isDefined(personHandleField)) {
        continue;
      }

      const getHandles = (person: PersonWorkspaceEntity | null) => {
        if (!isDefined(person)) {
          return [];
        }

        const { primary, additional } = getCanonicalPersonHandles({
          type: personHandleField.type,
          value: getPersonFieldValue({
            person,
            fieldName: personHandleField.name,
          }),
        });

        return [...primary, ...additional];
      };

      const handles = [
        ...new Set(
          personChanges.flatMap(({ before, after }) => {
            const handlesBefore = getHandles(before);
            const handlesAfter = getHandles(after);
            const isUnchanged =
              handlesBefore.length === handlesAfter.length &&
              handlesBefore.every((handle) => handlesAfter.includes(handle));

            return isUnchanged ? [] : [...handlesBefore, ...handlesAfter];
          }),
        ),
      ];

      if (handles.length > 0) {
        personHandleMatching.push({
          fieldUniversalIdentifier,
          messageChannelIds,
          handles,
        });
      }
    }

    return personHandleMatching;
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

    await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
      MessageParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        participantMatching: {
          personEmails,
          workspaceMemberIds: [],
        },
      },
    );
  }
}
