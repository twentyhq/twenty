import { WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';

export type CreateWebhookSubscriptionJobData = {
  channelType: WebhookSubscriptionChannelType;
  channelId: string;
  workspaceId: string;
};

@Processor(MessageQueue.webhookQueue)
export class CreateWebhookSubscriptionJob {
  constructor(
    private readonly messagingWebhookSubscriptionService: MessagingWebhookSubscriptionService,
    private readonly calendarWebhookSubscriptionService: CalendarWebhookSubscriptionService,
  ) {}

  @Process(CreateWebhookSubscriptionJob.name)
  async handle(data: CreateWebhookSubscriptionJobData): Promise<void> {
    const { channelType, channelId, workspaceId } = data;

    switch (channelType) {
      case WebhookSubscriptionChannelType.MESSAGING:
        await this.messagingWebhookSubscriptionService.createSubscription(
          channelId,
          workspaceId,
        );
        break;
      case WebhookSubscriptionChannelType.CALENDAR:
        await this.calendarWebhookSubscriptionService.createSubscription(
          channelId,
          workspaceId,
        );
        break;
    }
  }
}
