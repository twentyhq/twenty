import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { SnsEnvelopeService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/sns-envelope.service';
import { type SesOutboundNotification } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-notification.type';
import { normalizeSesOutboundEvent } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/normalize-ses-outbound-event.util';
import { OutboundDeliveryEventHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-delivery-event-handler.service';
import { OutboundSendingStateHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-sending-state-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

@Injectable()
export class SesOutboundWebhookDriverService {
  private readonly logger = new Logger(SesOutboundWebhookDriverService.name);

  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly snsEnvelopeService: SnsEnvelopeService,
    private readonly outboundDeliveryEventHandlerService: OutboundDeliveryEventHandlerService,
    private readonly outboundSendingStateHandlerService: OutboundSendingStateHandlerService,
  ) {}

  async handle(rawBody: Buffer): Promise<void> {
    const envelope =
      await this.snsEnvelopeService.openNotification<SesOutboundNotification>(
        rawBody,
      );

    if (!isDefined(envelope)) {
      return;
    }

    const { notification, messageId } = envelope;

    const event = normalizeSesOutboundEvent(notification);

    switch (event.status) {
      case 'DELIVERY':
        await this.outboundDeliveryEventHandlerService.handle({
          ...event.delivery,
          dedupeKey: messageId,
        });

        return;
      case 'SENDING_STATE':
        await this.outboundSendingStateHandlerService.handle(
          event.sendingState,
        );

        return;
      case 'UNPROCESSABLE':
        if (event.reason === 'UNSUPPORTED_EVENT_NAME') {
          this.logger.log(`Ignored SES outbound event ${event.eventName}`);

          return;
        }

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
