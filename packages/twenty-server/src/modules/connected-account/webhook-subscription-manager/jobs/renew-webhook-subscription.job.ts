import { WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';

export type RenewWebhookSubscriptionJobData = {
  channelType: WebhookSubscriptionChannelType;
  channelId: string;
  workspaceId: string;
};

@Processor(MessageQueue.webhookQueue)
export class RenewWebhookSubscriptionJob {
  constructor(
    private readonly messagingWebhookSubscriptionService: MessagingWebhookSubscriptionService,
    private readonly calendarWebhookSubscriptionService: CalendarWebhookSubscriptionService,
  ) {}

  @Process(RenewWebhookSubscriptionJob.name)
  async handle(data: RenewWebhookSubscriptionJobData): Promise<void> {
    const { channelType, channelId, workspaceId } = data;

    switch (channelType) {
      case WebhookSubscriptionChannelType.MESSAGING:
        await this.messagingWebhookSubscriptionService.renewSubscription({
          messageChannelId: channelId,
          workspaceId,
        });
        break;
      case WebhookSubscriptionChannelType.CALENDAR:
        await this.calendarWebhookSubscriptionService.renewSubscription({
          calendarChannelId: channelId,
          workspaceId,
        });
        break;
    }
  }
}
