import { Injectable } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/sns-subscription-confirmer.service';
import type SnsPayloadValidator from 'sns-payload-validator';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SnsEnvelopeService {
  constructor(
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly snsSubscriptionConfirmerService: SnsSubscriptionConfirmerService,
  ) {}

  async openNotification<TNotification>(
    rawBody: Buffer,
  ): Promise<{ notification: TNotification; messageId: string } | null> {
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

      return null;
    }

    if (payload.Type !== 'Notification') {
      return null;
    }

    const notification = parseJson<TNotification>(payload.Message);

    // parseJson happily returns a JSON scalar, which every caller then reads as
    // a notification object.
    if (!isObject(notification)) {
      throw new MessagingWebhookException(
        'Invalid SNS notification message',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    return { notification, messageId: payload.MessageId };
  }
}
