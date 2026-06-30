import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { CALENDAR_CHANNEL_DELETED_EVENT } from 'src/engine/metadata-modules/calendar-channel/constants/calendar-channel-deleted.constant';
import { type CalendarChannelDeletedEvent } from 'src/engine/metadata-modules/calendar-channel/types/calendar-channel-deleted.type';
import { MESSAGE_CHANNEL_DELETED_EVENT } from 'src/engine/metadata-modules/message-channel/constants/message-channel-deleted.constant';
import { type MessageChannelDeletedEvent } from 'src/engine/metadata-modules/message-channel/types/message-channel-deleted.type';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';

@Injectable()
export class WebhookSubscriptionChannelDeletedListener {
  constructor(
    private readonly messagingWebhookSubscriptionService: MessagingWebhookSubscriptionService,
    private readonly calendarWebhookSubscriptionService: CalendarWebhookSubscriptionService,
  ) {}

  @OnCustomBatchEvent(MESSAGE_CHANNEL_DELETED_EVENT)
  async handleMessageChannelDeleted(
    batchEvent: CustomWorkspaceEventBatch<MessageChannelDeletedEvent>,
  ): Promise<void> {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId)) {
      return;
    }

    for (const event of batchEvent.events) {
      await this.messagingWebhookSubscriptionService.deleteSubscription(
        event.messageChannelId,
        workspaceId,
      );
    }
  }

  @OnCustomBatchEvent(CALENDAR_CHANNEL_DELETED_EVENT)
  async handleCalendarChannelDeleted(
    batchEvent: CustomWorkspaceEventBatch<CalendarChannelDeletedEvent>,
  ): Promise<void> {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId)) {
      return;
    }

    for (const event of batchEvent.events) {
      await this.calendarWebhookSubscriptionService.deleteSubscription(
        event.calendarChannelId,
        workspaceId,
      );
    }
  }
}
