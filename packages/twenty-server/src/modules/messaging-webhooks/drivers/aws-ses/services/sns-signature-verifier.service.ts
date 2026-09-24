import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import SnsPayloadValidator from 'sns-payload-validator';

import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SnsSignatureVerifierService {
  private readonly logger = new Logger(SnsSignatureVerifierService.name);
  private readonly validator = new SnsPayloadValidator();

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async assertAllowedAndSigned(payload: SnsPayload): Promise<void> {
    this.assertTopicAllowlistedOrThrow(payload.TopicArn);

    try {
      await this.validator.validate(payload);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.warn(`SNS signature verification failed: ${errorMessage}`);

      throw new MessagingWebhookException(
        'SNS signature invalid',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }
  }

  private assertTopicAllowlistedOrThrow(topicArn: string): void {
    const allowlist = this.twentyConfigService.get(
      'SES_SNS_TOPIC_ARN_ALLOWLIST',
    );

    const allowedTopicArns = (allowlist ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(isNonEmptyString);

    if (!isNonEmptyArray(allowedTopicArns)) {
      throw new MessagingWebhookException(
        'SES_SNS_TOPIC_ARN_ALLOWLIST is not configured, every SES webhook payload is rejected',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_NOT_CONFIGURED,
      );
    }

    if (!allowedTopicArns.includes(topicArn)) {
      this.logger.warn(`SNS topic ${topicArn} is not in allowlist`);

      throw new MessagingWebhookException(
        'SNS topic not allowed',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_FORBIDDEN_TOPIC,
      );
    }
  }
}
