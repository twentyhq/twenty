import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CONNECTED_ACCOUNT_DELETED_EVENT } from 'src/engine/metadata-modules/connected-account/constants/connected-account-deleted.constant';
import { type ConnectedAccountDeletedEvent } from 'src/engine/metadata-modules/connected-account/types/connected-account-deleted.type';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import {
  MessagingConnectedAccountDeletionCleanupJob,
  type MessagingConnectedAccountDeletionCleanupJobData,
} from 'src/modules/messaging/message-cleaner/jobs/messaging-connected-account-deletion-cleanup.job';

@Injectable()
export class MessagingMessageCleanerConnectedAccountListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnCustomBatchEvent(CONNECTED_ACCOUNT_DELETED_EVENT)
  async handleDeletedEvent(
    batchEvent: CustomWorkspaceEventBatch<ConnectedAccountDeletedEvent>,
  ) {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId)) {
      return;
    }

    await Promise.all(
      batchEvent.events.map((event) =>
        this.messageQueueService.add<MessagingConnectedAccountDeletionCleanupJobData>(
          MessagingConnectedAccountDeletionCleanupJob.name,
          {
            workspaceId,
            connectedAccountId: event.connectedAccountId,
          },
        ),
      ),
    );
  }
}
