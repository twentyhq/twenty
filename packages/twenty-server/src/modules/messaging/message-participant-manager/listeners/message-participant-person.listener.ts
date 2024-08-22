import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/integrations/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import {
  MessageParticipantMatchParticipantJob,
  MessageParticipantMatchParticipantJobData,
} from 'src/modules/messaging/message-participant-manager/jobs/message-participant-match-participant.job';
import {
  MessageParticipantUnmatchParticipantJob,
  MessageParticipantUnmatchParticipantJobData,
} from 'src/modules/messaging/message-participant-manager/jobs/message-participant-unmatch-participant.job';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class MessageParticipantPersonListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('person.created')
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<PersonWorkspaceEntity>
    >,
  ) {
    for (const eventPayload of payload.events) {
      if (eventPayload.properties.after.email === null) {
        continue;
      }

      await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
        MessageParticipantMatchParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: eventPayload.properties.after.email,
          personId: eventPayload.recordId,
        },
      );
    }
  }

  @OnEvent('person.updated')
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
        ).includes('email')
      ) {
        await this.messageQueueService.add<MessageParticipantUnmatchParticipantJobData>(
          MessageParticipantUnmatchParticipantJob.name,
          {
            workspaceId: payload.workspaceId,
            email: eventPayload.properties.before.email,
            personId: eventPayload.recordId,
          },
        );

        await this.messageQueueService.add<MessageParticipantMatchParticipantJobData>(
          MessageParticipantMatchParticipantJob.name,
          {
            workspaceId: payload.workspaceId,
            email: eventPayload.properties.after.email,
            personId: eventPayload.recordId,
          },
        );
      }
    }
  }
}
