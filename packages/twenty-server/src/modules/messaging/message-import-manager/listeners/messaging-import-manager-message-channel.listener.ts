import { Injectable } from '@nestjs/common';

import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageChannelSubscriptionCleanupJob,
  MessageChannelSubscriptionCleanupJobData,
} from 'src/modules/messaging/message-channel-subscription-manager/jobs/message-channel-subscription-cleanup.job';
import {
  MessagingCleanCacheJob,
  type MessagingCleanCacheJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-clean-cache';

@Injectable()
export class MessagingMessageImportManagerMessageChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @OnDatabaseBatchEvent('messageChannel', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<MessageChannelWorkspaceEntity>
    >,
  ) {
    const cleanCachePromises = payload.events.map((eventPayload) =>
      this.messageQueueService.add<MessagingCleanCacheJobData>(
        MessagingCleanCacheJob.name,
        {
          workspaceId: payload.workspaceId,
          messageChannelId: eventPayload.recordId,
        },
      ),
    );

    const cleanupSubscriptionPromises: Promise<void>[] = [];

    if (this.twentyConfigService.get('MESSAGING_GMAIL_PUBSUB_ENABLED')) {
      for (const eventPayload of payload.events) {
        cleanupSubscriptionPromises.push(
          this.messageQueueService.add<MessageChannelSubscriptionCleanupJobData>(
            MessageChannelSubscriptionCleanupJob.name,
            {
              workspaceId: payload.workspaceId,
              messageChannelId: eventPayload.recordId,
              connectedAccountId:
                eventPayload.properties.before.connectedAccountId,
            },
          ),
        );
      }
    }

    await Promise.all([...cleanCachePromises, ...cleanupSubscriptionPromises]);
  }
}
