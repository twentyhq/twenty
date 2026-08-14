import { createHmac, timingSafeEqual } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

export type MailgunSignatureFields = {
  timestamp: string | undefined;
  token: string | undefined;
  signature: string | undefined;
};

// Mailgun signs webhooks with an HMAC-SHA256 hex digest over
// `${timestamp}${token}` keyed with the account's webhook signing key.
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

    const expectedSignature = createHmac('sha256', signingKey)
      .update(`${timestamp}${token}`)
      .digest();
    const candidateSignature = Buffer.from(signature, 'hex');

    const isSigned =
      candidateSignature.length === expectedSignature.length &&
      timingSafeEqual(candidateSignature, expectedSignature);

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
