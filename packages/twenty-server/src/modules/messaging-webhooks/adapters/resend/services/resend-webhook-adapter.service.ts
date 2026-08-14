import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray, parseJson } from 'twenty-shared/utils';

import { RESEND_WORKSPACE_TAG_NAME } from 'src/engine/core-modules/emailing-domain/drivers/resend/constants/resend-workspace-tag-name.constant';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import {
  type ResendWebhookHeaders,
  ResendWebhookVerifierService,
} from 'src/modules/messaging-webhooks/adapters/resend/services/resend-webhook-verifier.service';
import { type ResendWebhookEvent } from 'src/modules/messaging-webhooks/adapters/resend/types/resend-webhook-event.type';
import { getResendEventTagValue } from 'src/modules/messaging-webhooks/adapters/resend/utils/get-resend-event-tag-value.util';
import { InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { OutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-suppression-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-source.type';

@Injectable()
export class ResendWebhookAdapterService {
  private readonly logger = new Logger(ResendWebhookAdapterService.name);

  constructor(
    private readonly resendWebhookVerifierService: ResendWebhookVerifierService,
    private readonly outboundSuppressionHandlerService: OutboundSuppressionHandlerService,
    private readonly inboundMailHandlerService: InboundMailHandlerService,
  ) {}

  async handle(rawBody: Buffer, headers: ResendWebhookHeaders): Promise<void> {
    this.resendWebhookVerifierService.assertSigned(rawBody, headers);

    const event = parseJson<ResendWebhookEvent>(rawBody.toString('utf8'));

    if (!isDefined(event) || !isNonEmptyString(event.type)) {
      throw new MessagingWebhookException(
        'Invalid Resend webhook payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    switch (event.type) {
      case 'email.bounced':
        if (event.data?.bounce?.type !== 'Permanent') {
          return;
        }
        await this.handleSuppressionEvent(
          event,
          MessageSuppressionReason.BOUNCE,
        );

        return;
      case 'email.complained':
        await this.handleSuppressionEvent(
          event,
          MessageSuppressionReason.COMPLAINT,
        );

        return;
      case 'email.received':
        await this.handleReceivedEvent(event);

        return;
      default:
        return;
    }
  }

  private async handleSuppressionEvent(
    event: ResendWebhookEvent,
    reason:
      | MessageSuppressionReason.BOUNCE
      | MessageSuppressionReason.COMPLAINT,
  ): Promise<void> {
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

    const emailAddresses = event.data?.to ?? [];

    if (!isNonEmptyArray(emailAddresses)) {
      return;
    }

    await this.outboundSuppressionHandlerService.handle({
      workspaceId,
      reason,
      emailAddresses,
      providerMessageId: event.data?.email_id ?? null,
      providerEventId: event.data?.email_id ?? null,
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
