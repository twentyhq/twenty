import { Injectable } from '@nestjs/common';

import type SnsPayloadValidator from 'sns-payload-validator';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { SesInboundMailHandlerService } from 'src/modules/messaging-webhooks/services/ses-inbound-mail-handler.service';
import { SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/services/sns-subscription-confirmer.service';
import { type SesInboundNotification } from 'src/modules/messaging-webhooks/types/sns-message.type';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SesInboundWebhookRouterService {
  constructor(
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly snsSubscriptionConfirmerService: SnsSubscriptionConfirmerService,
    private readonly sesInboundMailHandlerService: SesInboundMailHandlerService,
  ) {}

  async route(rawBody: Buffer): Promise<void> {
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

      return;
    }

    if (payload.Type !== 'Notification') {
      return;
    }

    const notification = parseJson<SesInboundNotification>(payload.Message);

    if (!isDefined(notification)) {
      throw new MessagingWebhookException(
        'Invalid SNS notification message',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    await this.sesInboundMailHandlerService.handle(
      notification,
      payload.MessageId,
    );
  }
}
