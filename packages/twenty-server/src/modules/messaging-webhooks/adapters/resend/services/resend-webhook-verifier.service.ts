import { createHmac, timingSafeEqual } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

const SIGNING_SECRET_PREFIX = 'whsec_';
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

export type ResendWebhookHeaders = {
  svixId: string | undefined;
  svixTimestamp: string | undefined;
  svixSignature: string | undefined;
};

// Resend signs webhooks with the Svix scheme: an HMAC-SHA256 over
// `${id}.${timestamp}.${body}` keyed with the base64 secret after `whsec_`,
// carried base64-encoded in the space-separated `v1,<sig>` signature header.
@Injectable()
export class ResendWebhookVerifierService {
  private readonly logger = new Logger(ResendWebhookVerifierService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  assertSigned(rawBody: Buffer, headers: ResendWebhookHeaders): void {
    const signingSecret = this.twentyConfigService.get(
      'RESEND_WEBHOOK_SIGNING_SECRET',
    );

    if (!isNonEmptyString(signingSecret)) {
      throw new MessagingWebhookException(
        'RESEND_WEBHOOK_SIGNING_SECRET is not configured',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_NOT_CONFIGURED,
      );
    }

    const { svixId, svixTimestamp, svixSignature } = headers;

    if (
      !isNonEmptyString(svixId) ||
      !isNonEmptyString(svixTimestamp) ||
      !isNonEmptyString(svixSignature)
    ) {
      throw new MessagingWebhookException(
        'Missing Svix signature headers',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }

    this.assertTimestampWithinTolerance(svixTimestamp);

    const secretKey = Buffer.from(
      signingSecret.startsWith(SIGNING_SECRET_PREFIX)
        ? signingSecret.slice(SIGNING_SECRET_PREFIX.length)
        : signingSecret,
      'base64',
    );

    const expectedSignature = createHmac('sha256', secretKey)
      .update(`${svixId}.${svixTimestamp}.${rawBody.toString('utf8')}`)
      .digest();

    const isSigned = svixSignature
      .split(' ')
      .map((entry) => entry.split(',')[1])
      .filter(isNonEmptyString)
      .some((candidate) => {
        const candidateSignature = Buffer.from(candidate, 'base64');

        return (
          candidateSignature.length === expectedSignature.length &&
          timingSafeEqual(candidateSignature, expectedSignature)
        );
      });

    if (!isSigned) {
      this.logger.warn('Resend webhook signature verification failed');

      throw new MessagingWebhookException(
        'Resend webhook signature invalid',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }
  }

  private assertTimestampWithinTolerance(svixTimestamp: string): void {
    const timestampSeconds = Number.parseInt(svixTimestamp, 10);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
      !Number.isFinite(timestampSeconds) ||
      Math.abs(nowSeconds - timestampSeconds) > TIMESTAMP_TOLERANCE_SECONDS
    ) {
      throw new MessagingWebhookException(
        'Resend webhook timestamp outside tolerance',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }
  }
}
