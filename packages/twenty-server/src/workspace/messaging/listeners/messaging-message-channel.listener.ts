import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordDeleteEvent } from 'src/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  DeleteMessageChannelMessageAssociationJob,
  DeleteMessageChannelMessageAssociationJobData,
} from 'src/workspace/messaging/jobs/delete-message-channel-message-association.job';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';

@Injectable()
export class MessagingMessageChannelListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('messageChannel.deleted')
  handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<MessageChannelObjectMetadata>,
  ) {
    this.messageQueueService.add<DeleteMessageChannelMessageAssociationJobData>(
      DeleteMessageChannelMessageAssociationJob.name,
      {
        workspaceId: payload.workspaceId,
        messageChannelId: payload.deletedRecord.id,
      },
    );
  }
}
