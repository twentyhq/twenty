import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingCleanCacheJob,
  MessagingCleanCacheJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-clean-cache';

@Injectable()
export class MessagingMessageImportManagerMessageChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('messageChannel.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<MessageChannelWorkspaceEntity>,
  ) {
    await this.messageQueueService.add<MessagingCleanCacheJobData>(
      MessagingCleanCacheJob.name,
      {
        workspaceId: payload.workspaceId,
        messageChannelId: payload.recordId,
      },
    );
  }
}
