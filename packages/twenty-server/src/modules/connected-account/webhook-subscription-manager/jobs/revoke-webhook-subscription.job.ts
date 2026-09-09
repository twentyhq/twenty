import { WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';
import { type WebhookSubscriptionChannelReference } from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-channel-reference.type';

@Processor(MessageQueue.webhookQueue)
export class RevokeWebhookSubscriptionJob {
  constructor(
    private readonly messagingWebhookSubscriptionService: MessagingWebhookSubscriptionService,
    private readonly calendarWebhookSubscriptionService: CalendarWebhookSubscriptionService,
  ) {}

  @Process(RevokeWebhookSubscriptionJob.name)
  async handle(data: WebhookSubscriptionChannelReference): Promise<void> {
    const { channelType, channelId, workspaceId } = data;

    switch (channelType) {
      case WebhookSubscriptionChannelType.MESSAGING:
        await this.messagingWebhookSubscriptionService.revokeSubscription({
          messageChannelId: channelId,
          workspaceId,
        });
        break;
      case WebhookSubscriptionChannelType.CALENDAR:
        await this.calendarWebhookSubscriptionService.revokeSubscription({
          calendarChannelId: channelId,
          workspaceId,
        });
        break;
    }
  }
}
