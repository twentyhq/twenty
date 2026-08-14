import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { type NormalizedOutboundSuppressionEvent } from 'src/modules/messaging-webhooks/types/normalized-outbound-email-event.type';

@Injectable()
export class OutboundSuppressionHandlerService {
  constructor(
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly messageCampaignService: MessageCampaignService,
  ) {}

  async handle(event: NormalizedOutboundSuppressionEvent): Promise<void> {
    if (isDefined(event.providerMessageId)) {
      await this.messageCampaignService.recordDeliveryFailureByProviderMessageId(
        {
          workspaceId: event.workspaceId,
          providerMessageId: event.providerMessageId,
          deliveryStatus:
            event.reason === MessageSuppressionReason.COMPLAINT
              ? CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED
              : CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
        },
      );
    }

    const results = await Promise.allSettled(
      event.emailAddresses.map((emailAddress) =>
        this.messageSuppressionService.suppress({
          workspaceId: event.workspaceId,
          emailAddress,
          reason: event.reason,
          source: MessageSuppressionSource.WEBHOOK,
          providerEventId: event.providerEventId,
        }),
      ),
    );

    if (results.some((result) => result.status === 'rejected')) {
      throw new Error(
        `Failed to suppress one or more recipients for ${event.reason} event in workspace ${event.workspaceId}`,
      );
    }
  }
}
