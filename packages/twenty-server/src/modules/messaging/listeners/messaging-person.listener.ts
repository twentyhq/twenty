import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/integrations/event-emitter/utils/object-record-changed-properties.util';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  MatchMessageParticipantJob,
  MatchMessageParticipantsJobData,
} from 'src/modules/messaging/jobs/match-message-participant.job';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';

@Injectable()
export class MessagingPersonListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('person.created')
  async handleCreatedEvent(
    payload: ObjectRecordCreateEvent<PersonObjectMetadata>,
  ) {
    if (payload.details.after.email === null) {
      return;
    }

    this.messageQueueService.add<MatchMessageParticipantsJobData>(
      MatchMessageParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        email: payload.details.after.email,
        personId: payload.recordId,
      },
    );
  }

  @OnEvent('person.updated')
  async handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<PersonObjectMetadata>,
  ) {
    if (
      objectRecordUpdateEventChangedProperties(
        payload.details.before,
        payload.details.after,
      ).includes('email')
    ) {
      this.messageQueueService.add<MatchMessageParticipantsJobData>(
        MatchMessageParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: payload.details.after.email,
          personId: payload.recordId,
        },
      );
    }
  }
}
