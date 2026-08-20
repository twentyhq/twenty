import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { RESEND_WORKSPACE_TAG_NAME } from 'src/engine/core-modules/emailing-domain/drivers/resend/constants/resend-workspace-tag-name.constant';
import { ResendWebhookVerifierService } from 'src/modules/messaging-webhooks/drivers/resend/services/resend-webhook-verifier.service';
import { type ResendWebhookHeaders } from 'src/modules/messaging-webhooks/drivers/resend/types/resend-webhook-headers.type';
import { type ResendWebhookEvent } from 'src/modules/messaging-webhooks/drivers/resend/types/resend-webhook-event.type';
import { getResendEventTagValue } from 'src/modules/messaging-webhooks/drivers/resend/utils/get-resend-event-tag-value.util';
import { resolveResendOutboundDeliveryOutcome } from 'src/modules/messaging-webhooks/drivers/resend/utils/resolve-resend-outbound-delivery-outcome.util';
import { InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { OutboundDeliveryEventHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-delivery-event-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-message-source.constant';

@Injectable()
export class ResendWebhookDriverService {
  private readonly logger = new Logger(ResendWebhookDriverService.name);

  constructor(
    private readonly resendWebhookVerifierService: ResendWebhookVerifierService,
    private readonly outboundDeliveryEventHandlerService: OutboundDeliveryEventHandlerService,
    private readonly inboundMailHandlerService: InboundMailHandlerService,
  ) {}

  async handle(rawBody: Buffer, headers: ResendWebhookHeaders): Promise<void> {
    this.resendWebhookVerifierService.assertSigned(rawBody, headers);

    const { svixId } = headers;

    if (!isNonEmptyString(svixId)) {
      throw new MessagingWebhookException(
        'Resend webhook payload has no svix-id header',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    const event = parseJson<ResendWebhookEvent>(rawBody.toString('utf8'));

    if (!isDefined(event) || !isNonEmptyString(event.type)) {
      throw new MessagingWebhookException(
        'Invalid Resend webhook payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    if (event.type === 'email.received') {
      await this.handleReceivedEvent(event);

      return;
    }

    await this.handleDeliveryEvent({ event, dedupeKey: svixId });
  }

  private async handleDeliveryEvent({
    event,
    dedupeKey,
  }: {
    event: ResendWebhookEvent;
    dedupeKey: string;
  }): Promise<void> {
    const outcome = resolveResendOutboundDeliveryOutcome(event);

    if (!isDefined(outcome)) {
      return;
    }

    const workspaceId = getResendEventTagValue(
      event.data?.tags,
      RESEND_WORKSPACE_TAG_NAME,
    );

    if (!isNonEmptyString(workspaceId)) {
      this.logger.warn(
        `Ignoring Resend ${event.type} event without a ${RESEND_WORKSPACE_TAG_NAME} tag`,
      );

      return;
    }

    await this.outboundDeliveryEventHandlerService.handle({
      workspaceId,
      deliveryStatus: outcome.deliveryStatus,
      suppression: outcome.suppression,
      providerMessageId: event.data?.email_id ?? null,
      providerEventId: outcome.providerEventId,
      dedupeKey,
    });
  }

  private async handleReceivedEvent(event: ResendWebhookEvent): Promise<void> {
    const emailId = event.data?.email_id;

    if (!isNonEmptyString(emailId)) {
      throw new MessagingWebhookException(
        'Resend email.received event has no email_id',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    // received_for carries the envelope recipients; to/cc cover mail
    // delivered through aliases or group expansion
    const recipients = [
      ...(event.data?.received_for ?? []),
      ...(event.data?.to ?? []),
      ...(event.data?.cc ?? []),
    ];

    await this.inboundMailHandlerService.handle({
      recipients,
      subject: event.data?.subject ?? null,
      message: {
        source: INBOUND_EMAIL_MESSAGE_SOURCE.RESEND,
        reference: emailId,
      },
      dedupeKey: emailId,
    });
  }
}
