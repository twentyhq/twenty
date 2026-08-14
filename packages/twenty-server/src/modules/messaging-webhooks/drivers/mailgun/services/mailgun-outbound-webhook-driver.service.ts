import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { MAILGUN_WORKSPACE_VARIABLE_NAME } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/constants/mailgun-workspace-variable-name.constant';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MailgunWebhookVerifierService } from 'src/modules/messaging-webhooks/drivers/mailgun/services/mailgun-webhook-verifier.service';
import { type MailgunOutboundWebhookPayload } from 'src/modules/messaging-webhooks/drivers/mailgun/types/mailgun-webhook-event.type';
import { OutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-suppression-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

@Injectable()
export class MailgunOutboundWebhookDriverService {
  private readonly logger = new Logger(
    MailgunOutboundWebhookDriverService.name,
  );

  constructor(
    private readonly mailgunWebhookVerifierService: MailgunWebhookVerifierService,
    private readonly outboundSuppressionHandlerService: OutboundSuppressionHandlerService,
  ) {}

  async handle(rawBody: Buffer): Promise<void> {
    const payload = parseJson<MailgunOutboundWebhookPayload>(
      rawBody.toString('utf8'),
    );

    if (!isDefined(payload)) {
      throw new MessagingWebhookException(
        'Invalid Mailgun webhook payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    this.mailgunWebhookVerifierService.assertSigned({
      timestamp: payload.signature?.timestamp,
      token: payload.signature?.token,
      signature: payload.signature?.signature,
    });

    const eventData = payload['event-data'];

    if (!isDefined(eventData) || !isNonEmptyString(eventData.event)) {
      throw new MessagingWebhookException(
        'Mailgun webhook payload has no event data',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    const suppressionReason = this.resolveSuppressionReason(eventData);

    if (!isDefined(suppressionReason)) {
      return;
    }

    const workspaceId =
      eventData['user-variables']?.[MAILGUN_WORKSPACE_VARIABLE_NAME];

    if (!isNonEmptyString(workspaceId)) {
      this.logger.warn(
        `Ignoring Mailgun ${eventData.event} event without a ${MAILGUN_WORKSPACE_VARIABLE_NAME} variable`,
      );

      return;
    }

    const recipient = eventData.recipient;

    if (!isNonEmptyString(recipient)) {
      return;
    }

    await this.outboundSuppressionHandlerService.handle({
      workspaceId,
      reason: suppressionReason,
      emailAddresses: [recipient],
      providerMessageId: eventData.message?.headers?.['message-id'] ?? null,
      providerEventId: eventData.id ?? null,
    });
  }

  private resolveSuppressionReason(
    eventData: MailgunOutboundWebhookPayload['event-data'],
  ):
    | MessageSuppressionReason.BOUNCE
    | MessageSuppressionReason.COMPLAINT
    | null {
    if (eventData?.event === 'failed' && eventData.severity === 'permanent') {
      return MessageSuppressionReason.BOUNCE;
    }

    if (eventData?.event === 'complained') {
      return MessageSuppressionReason.COMPLAINT;
    }

    return null;
  }
}
