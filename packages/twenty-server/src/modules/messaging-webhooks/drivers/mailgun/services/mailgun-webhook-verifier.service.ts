/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type MailgunSignatureFields } from 'src/modules/messaging-webhooks/drivers/mailgun/types/mailgun-signature-fields.type';
import { verifyMailgunSignature } from 'src/modules/messaging-webhooks/drivers/mailgun/utils/verify-mailgun-signature.util';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

@Injectable()
export class MailgunWebhookVerifierService {
  private readonly logger = new Logger(MailgunWebhookVerifierService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  assertSigned(fields: MailgunSignatureFields): void {
    const signingKey = this.twentyConfigService.get(
      'MAILGUN_WEBHOOK_SIGNING_KEY',
    );

    if (!isNonEmptyString(signingKey)) {
      throw new MessagingWebhookException(
        'MAILGUN_WEBHOOK_SIGNING_KEY is not configured',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_NOT_CONFIGURED,
      );
    }

    const { timestamp, token, signature } = fields;

    if (
      !isNonEmptyString(timestamp) ||
      !isNonEmptyString(token) ||
      !isNonEmptyString(signature)
    ) {
      throw new MessagingWebhookException(
        'Missing Mailgun signature fields',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }

    this.assertTimestampWithinTolerance(timestamp);

    const isSigned = verifyMailgunSignature({
      signingKey,
      timestamp,
      token,
      signature,
    });

    if (!isSigned) {
      this.logger.warn('Mailgun webhook signature verification failed');

      throw new MessagingWebhookException(
        'Mailgun webhook signature invalid',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }
  }

  private assertTimestampWithinTolerance(timestamp: string): void {
    const timestampSeconds = Number.parseInt(timestamp, 10);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
      !Number.isFinite(timestampSeconds) ||
      Math.abs(nowSeconds - timestampSeconds) > TIMESTAMP_TOLERANCE_SECONDS
    ) {
      throw new MessagingWebhookException(
        'Mailgun webhook timestamp outside tolerance',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }
  }
}
