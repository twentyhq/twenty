import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type SesEventBridgeNotification } from 'src/modules/messaging-webhooks/types/ses-event-bridge-notification.type';
import { resolveWorkspaceIdFromAwsSesResources } from 'src/modules/messaging-webhooks/utils/resolve-workspace-id-from-aws-ses-resources.util';

@Injectable()
export class SesOutboundSuppressionHandlerService {
  private readonly logger = new Logger(
    SesOutboundSuppressionHandlerService.name,
  );

  constructor(
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly messageCampaignService: MessageCampaignService,
  ) {}

  async handle(event: SesEventBridgeNotification): Promise<void> {
    const suppression = this.resolveSuppression(event);

    if (!isDefined(suppression)) {
      return;
    }

    const workspaceId = resolveWorkspaceIdFromAwsSesResources(event.resources);

    if (!isDefined(workspaceId)) {
      this.logger.warn(
        `Could not resolve workspaceId from SES ${event['detail-type']} event resources: ${JSON.stringify(event.resources)}`,
      );

      return;
    }

    // Record the per-recipient campaign outcome by correlating the SES send id.
    // Additive to the address-level suppression below.
    const providerMessageId = event.detail?.mail?.messageId;

    if (isDefined(providerMessageId)) {
      await this.messageCampaignService.recordDeliveryFailureByProviderMessageId(
        {
          workspaceId,
          providerMessageId,
          deliveryStatus:
            event['detail-type'] === 'Email Complaint Received'
              ? CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED
              : CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
        },
      );
    }

    const results = await Promise.allSettled(
      suppression.emailAddresses.map((emailAddress) =>
        this.messageSuppressionService.suppress({
          workspaceId,
          emailAddress,
          reason: suppression.reason,
          source: MessageSuppressionSource.WEBHOOK,
          providerEventId: suppression.providerEventId,
        }),
      ),
    );

    if (results.some((result) => result.status === 'rejected')) {
      throw new Error(
        `Failed to suppress one or more recipients for ${event['detail-type']} event in workspace ${workspaceId}`,
      );
    }
  }

  private resolveSuppression(event: SesEventBridgeNotification): {
    reason: MessageSuppressionReason;
    emailAddresses: string[];
    providerEventId: string | null;
  } | null {
    if (event['detail-type'] === 'Email Bounced') {
      const bounce = event.detail?.bounce;

      if (bounce?.bounceType !== 'Permanent') {
        return null;
      }

      const emailAddresses = this.extractRecipientAddresses(
        bounce.bouncedRecipients,
      );

      if (!isNonEmptyArray(emailAddresses)) {
        return null;
      }

      return {
        reason: MessageSuppressionReason.BOUNCE,
        emailAddresses,
        providerEventId: bounce.feedbackId ?? null,
      };
    }

    if (event['detail-type'] === 'Email Complaint Received') {
      const complaint = event.detail?.complaint;
      const emailAddresses = this.extractRecipientAddresses(
        complaint?.complainedRecipients,
      );

      if (!isNonEmptyArray(emailAddresses)) {
        return null;
      }

      return {
        reason: MessageSuppressionReason.COMPLAINT,
        emailAddresses,
        providerEventId: complaint?.feedbackId ?? null,
      };
    }

    return null;
  }

  private extractRecipientAddresses = (
    recipients: { emailAddress: string }[] | undefined,
  ): string[] => {
    return (recipients ?? [])
      .map((recipient) => recipient.emailAddress)
      .filter(isDefined);
  };
}
