import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ResendWebhookHeaders } from 'src/modules/messaging-webhooks/drivers/resend/types/resend-webhook-headers.type';
import { verifySvixSignature } from 'src/modules/messaging-webhooks/drivers/resend/utils/verify-svix-signature.util';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

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

    const isSigned = verifySvixSignature({
      signingSecret,
      svixId,
      svixTimestamp,
      svixSignature,
      rawBody,
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
