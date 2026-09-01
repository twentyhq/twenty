import { Injectable } from '@nestjs/common';

import type SnsPayloadValidator from 'sns-payload-validator';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/sns-subscription-confirmer.service';
import { type SesOutboundNotification } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-notification.type';
import { normalizeSesOutboundEvent } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/normalize-ses-outbound-event.util';
import { OutboundDeliveryEventHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-delivery-event-handler.service';
import { OutboundSendingStateHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-sending-state-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SesOutboundWebhookDriverService {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly snsSubscriptionConfirmerService: SnsSubscriptionConfirmerService,
    private readonly outboundDeliveryEventHandlerService: OutboundDeliveryEventHandlerService,
    private readonly outboundSendingStateHandlerService: OutboundSendingStateHandlerService,
  ) {}

  async handle(rawBody: Buffer): Promise<void> {
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

    const notification = parseJson<SesOutboundNotification>(payload.Message);

    if (!isDefined(notification)) {
      throw new MessagingWebhookException(
        'Invalid SNS notification message',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    const event = normalizeSesOutboundEvent(notification);

    switch (event.status) {
      case 'DELIVERY':
        await this.outboundDeliveryEventHandlerService.handle({
          ...event.delivery,
          dedupeKey: payload.MessageId,
        });

        return;
      case 'SENDING_STATE':
        await this.outboundSendingStateHandlerService.handle(
          event.sendingState,
        );

        return;
      case 'UNPROCESSABLE':
        this.exceptionHandlerService.captureExceptions([
          new MessagingWebhookException(
            `Dropped SES outbound event ${event.eventName}: ${event.reason}`,
            MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_UNHANDLED_ERROR,
          ),
        ]);

        return;
    }
  }
}
