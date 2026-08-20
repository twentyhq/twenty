import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { MessageCampaignDeliveryFeedbackService } from 'src/modules/emailing/services/message-campaign-delivery-feedback.service';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { type NormalizedOutboundDeliveryEvent } from 'src/modules/messaging-webhooks/types/normalized-outbound-delivery-event.type';

@Injectable()
export class OutboundDeliveryEventProcessorService {
  constructor(
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly messageCampaignDeliveryFeedbackService: MessageCampaignDeliveryFeedbackService,
  ) {}

  async process(event: NormalizedOutboundDeliveryEvent): Promise<void> {
    const { suppression } = event;

    if (isDefined(suppression)) {
      const results = await Promise.allSettled(
        suppression.emailAddresses.map((emailAddress) =>
          this.messageSuppressionService.suppress({
            workspaceId: event.workspaceId,
            emailAddress,
            reason: suppression.reason,
            source: MessageSuppressionSource.WEBHOOK,
            providerEventId: event.providerEventId,
          }),
        ),
      );

      if (results.some((result) => result.status === 'rejected')) {
        throw new MessagingWebhookException(
          `Failed to suppress one or more recipients for ${suppression.reason} event in workspace ${event.workspaceId}`,
          MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_UNHANDLED_ERROR,
        );
      }
    }

    if (!isDefined(event.providerMessageId)) {
      return;
    }

    await this.messageCampaignDeliveryFeedbackService.recordDeliveryStatusByProviderMessageId(
      {
        workspaceId: event.workspaceId,
        providerMessageId: event.providerMessageId,
        deliveryStatus: event.deliveryStatus,
      },
    );
  }
}
