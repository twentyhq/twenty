import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MailgunWebhookVerifierService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-webhook-verifier.service';
import { parseMailgunInboundNotify } from 'src/modules/messaging-webhooks/adapters/mailgun/utils/parse-mailgun-inbound-notify.util';
import { InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-source.type';

// Handles the notify callback of a Mailgun store() route action: the raw
// message stays in Mailgun storage and the payload carries its retrieval URL.
@Injectable()
export class MailgunInboundWebhookAdapterService {
  constructor(
    private readonly mailgunWebhookVerifierService: MailgunWebhookVerifierService,
    private readonly inboundMailHandlerService: InboundMailHandlerService,
  ) {}

  async handle(body: unknown, contentType: string | undefined): Promise<void> {
    const fields = parseMailgunInboundNotify(body, contentType);

    if (!isDefined(fields)) {
      throw new MessagingWebhookException(
        'Invalid Mailgun inbound notification payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    if (
      !isNonEmptyString(fields.messageUrl) ||
      !isNonEmptyString(fields.recipient) ||
      !isNonEmptyString(fields.token)
    ) {
      throw new MessagingWebhookException(
        'Mailgun inbound notification is missing message-url or recipient',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    this.mailgunWebhookVerifierService.assertSigned({
      timestamp: fields.timestamp,
      token: fields.token,
      signature: fields.signature,
    });

    await this.inboundMailHandlerService.handle({
      recipients: fields.recipient
        .split(',')
        .map((recipient) => recipient.trim())
        .filter(isNonEmptyString),
      subject: fields.subject ?? null,
      message: {
        source: INBOUND_EMAIL_MESSAGE_SOURCE.MAILGUN,
        reference: fields.messageUrl,
      },
      dedupeKey: fields.token,
    });
  }
}
