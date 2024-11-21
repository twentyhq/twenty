import { Injectable } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  MessageParticipantMatchParticipantJob,
  MessageParticipantMatchParticipantJobData,
} from 'src/modules/messaging/message-participant-manager/jobs/message-participant-match-participant.job';
import {
  MessageParticipantUnmatchParticipantJob,
  MessageParticipantUnmatchParticipantJobData,
} from 'src/modules/messaging/message-participant-manager/jobs/message-participant-unmatch-participant.job';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

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
    for (const eventPayload of payload.events) {
      if (!eventPayload.properties.after.emails?.primaryEmail) {
        continue;
      }

      await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
        MessageParticipantMatchParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: eventPayload.properties.after.emails?.primaryEmail,
          personId: eventPayload.recordId,
        },
      );
    }
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<PersonWorkspaceEntity>
    >,
  ) {
    for (const eventPayload of payload.events) {
      if (
        objectRecordUpdateEventChangedProperties(
          eventPayload.properties.before,
          eventPayload.properties.after,
        ).includes('emails')
      ) {
        await this.messageQueueService.add<MessageParticipantUnmatchParticipantJobData>(
          MessageParticipantUnmatchParticipantJob.name,
          {
            workspaceId: payload.workspaceId,
            email: eventPayload.properties.before.emails?.primaryEmail,
            personId: eventPayload.recordId,
          },
        );

        await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
          MessageParticipantMatchParticipantJob.name,
          {
            workspaceId: payload.workspaceId,
            email: eventPayload.properties.after.emails?.primaryEmail,
            personId: eventPayload.recordId,
          },
        );
      }
    }
  }
}
