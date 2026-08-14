import { Injectable, Logger } from '@nestjs/common';

import type SnsPayloadValidator from 'sns-payload-validator';
import { isDefined, isNonEmptyArray, parseJson } from 'twenty-shared/utils';

import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/sns-subscription-confirmer.service';
import { type SesEventBridgeNotification } from 'src/modules/messaging-webhooks/adapters/aws-ses/types/ses-event-bridge-notification.type';
import { resolveWorkspaceIdFromAwsSesResources } from 'src/modules/messaging-webhooks/adapters/aws-ses/utils/resolve-workspace-id-from-aws-ses-resources.util';
import { OutboundSendingStateHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-sending-state-handler.service';
import { OutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-suppression-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SesOutboundWebhookAdapterService {
  private readonly logger = new Logger(SesOutboundWebhookAdapterService.name);

  constructor(
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly snsSubscriptionConfirmerService: SnsSubscriptionConfirmerService,
    private readonly outboundSuppressionHandlerService: OutboundSuppressionHandlerService,
    private readonly outboundSendingStateHandlerService: OutboundSendingStateHandlerService,
  ) {}

  async handle(rawBody: Buffer): Promise<void> {
    const payload = parseJson<SnsPayload>(rawBody.toString('utf8'));

    if (!isDefined(payload)) {
      throw new MessagingWebhookException(
        'Invalid SNS payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    await this.snsSignatureVerifierService.assertAllowedAndSigned(payload);

    if (
      payload.Type === 'SubscriptionConfirmation' ||
      payload.Type === 'UnsubscribeConfirmation'
    ) {
      await this.snsSubscriptionConfirmerService.confirm(payload.SubscribeURL);

      return;
    }

    if (payload.Type !== 'Notification') {
      return;
    }

    const event = parseJson<SesEventBridgeNotification>(payload.Message);

    if (!isDefined(event)) {
      throw new MessagingWebhookException(
        'Invalid SNS notification message',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    if (
      event['detail-type'] === 'Email Bounced' ||
      event['detail-type'] === 'Email Complaint Received'
    ) {
      await this.handleSuppressionEvent(event);

      return;
    }

    await this.handleSendingStateEvent(event);
  }

  private async handleSuppressionEvent(
    event: SesEventBridgeNotification,
  ): Promise<void> {
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

    await this.outboundSuppressionHandlerService.handle({
      workspaceId,
      reason: suppression.reason,
      emailAddresses: suppression.emailAddresses,
      providerMessageId: event.detail?.mail?.messageId ?? null,
      providerEventId: suppression.providerEventId,
    });
  }

  private async handleSendingStateEvent(
    event: SesEventBridgeNotification,
  ): Promise<void> {
    const workspaceId = resolveWorkspaceIdFromAwsSesResources(event.resources);

    if (!isDefined(workspaceId)) {
      this.logger.warn(
        `Could not resolve workspaceId from SES sending-state event resources: ${JSON.stringify(event.resources)}`,
      );

      return;
    }

    await this.outboundSendingStateHandlerService.handle({
      workspaceId,
      status:
        event['detail-type'] === 'Sending Status Enabled'
          ? EmailingDomainTenantStatus.ACTIVE
          : EmailingDomainTenantStatus.PAUSED,
    });
  }

  private resolveSuppression(event: SesEventBridgeNotification): {
    reason:
      | MessageSuppressionReason.BOUNCE
      | MessageSuppressionReason.COMPLAINT;
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
