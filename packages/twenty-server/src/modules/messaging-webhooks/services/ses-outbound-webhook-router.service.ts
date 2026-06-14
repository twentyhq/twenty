import { Injectable } from '@nestjs/common';

import type SnsPayloadValidator from 'sns-payload-validator';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { SesOutboundSendingStateHandlerService } from 'src/modules/messaging-webhooks/services/ses-outbound-sending-state-handler.service';
import { SesOutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/services/ses-outbound-suppression-handler.service';
import { SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/services/sns-subscription-confirmer.service';
import { type SesEventBridgeNotification } from 'src/modules/messaging-webhooks/types/ses-event-bridge-notification.type';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SesOutboundWebhookRouterService {
  constructor(
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly snsSubscriptionConfirmerService: SnsSubscriptionConfirmerService,
    private readonly sesOutboundSendingStateHandlerService: SesOutboundSendingStateHandlerService,
    private readonly sesOutboundSuppressionHandlerService: SesOutboundSuppressionHandlerService,
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

    const event = parseJson<SesEventBridgeNotification>(payload.Message);

    if (!isDefined(event)) {
      throw new MessagingWebhookException(
        'Invalid SNS notification message',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    if (
      event['detail-type'] === 'Email Bounced' ||
      event['detail-type'] === 'Email Complaint Received'
    ) {
      await this.sesOutboundSuppressionHandlerService.handle(event);

      return;
    }

    await this.sesOutboundSendingStateHandlerService.handle(event);
  }
}
