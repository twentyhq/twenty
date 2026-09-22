import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingMessageWebhookSyncService } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/services/messaging-message-webhook-sync.service';
import { type MessagingMessageWebhookSyncJobData } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/types/messaging-message-webhook-sync-job-data.type';

@Processor({
  queueName: MessageQueue.connectedAccountSyncWebhookQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessageWebhookSyncJob {
  constructor(
    private readonly messagingMessageWebhookSyncService: MessagingMessageWebhookSyncService,
  ) {}

  @Process(MessagingMessageWebhookSyncJob.name)
  async handle(data: MessagingMessageWebhookSyncJobData): Promise<void> {
    await this.messagingMessageWebhookSyncService.processMessagingMessageWebhookSync(
      data,
    );
  }
}
