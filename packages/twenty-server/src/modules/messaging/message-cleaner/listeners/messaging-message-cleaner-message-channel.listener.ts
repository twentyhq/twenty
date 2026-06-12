import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MESSAGE_CHANNEL_DELETED_EVENT,
  type MessageChannelDeletedEvent,
} from 'src/engine/metadata-modules/message-channel/constants/message-channel-deleted.constant';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import {
  MessagingMessageChannelDeletionCleanupJob,
  type MessagingMessageChannelDeletionCleanupJobData,
} from 'src/modules/messaging/message-cleaner/jobs/messaging-message-channel-deletion-cleanup.job';

@Injectable()
export class MessagingMessageCleanerMessageChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnCustomBatchEvent(MESSAGE_CHANNEL_DELETED_EVENT)
  async handleDeletedEvent(
    batchEvent: CustomWorkspaceEventBatch<MessageChannelDeletedEvent>,
  ) {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId)) {
      return;
    }

    await Promise.all(
      batchEvent.events.map((event) =>
        this.messageQueueService.add<MessagingMessageChannelDeletionCleanupJobData>(
          MessagingMessageChannelDeletionCleanupJob.name,
          {
            workspaceId,
            messageChannelId: event.messageChannelId,
          },
        ),
      ),
    );
  }
}
