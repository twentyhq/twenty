import { Injectable, Logger } from '@nestjs/common';

import type SnsPayloadValidator from 'sns-payload-validator';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/sns-subscription-confirmer.service';
import { type SesInboundNotification } from 'src/modules/messaging-webhooks/adapters/aws-ses/types/sns-message.type';
import { InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { type NormalizedInboundMailNotification } from 'src/modules/messaging-webhooks/types/normalized-inbound-mail-notification.type';
import {
  type InboundEmailMessageReference,
  INBOUND_EMAIL_MESSAGE_SOURCE,
} from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-source.type';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SesInboundWebhookAdapterService {
  private readonly logger = new Logger(SesInboundWebhookAdapterService.name);

  constructor(
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly snsSubscriptionConfirmerService: SnsSubscriptionConfirmerService,
    private readonly inboundMailHandlerService: InboundMailHandlerService,
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

    const notification = parseJson<SesInboundNotification>(payload.Message);

    if (!isDefined(notification)) {
      throw new MessagingWebhookException(
        'Invalid SNS notification message',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    await this.inboundMailHandlerService.handle(
      this.normalizeNotification(notification, payload.MessageId),
    );
  }

  private normalizeNotification(
    notification: SesInboundNotification,
    snsMessageId: string,
  ): NormalizedInboundMailNotification {
    const action = notification.receipt?.action;

    let message: InboundEmailMessageReference | null = null;

    if (action?.type === 'S3') {
      message = {
        source: INBOUND_EMAIL_MESSAGE_SOURCE.SES_S3,
        reference: action.objectKey,
      };
    } else {
      this.logger.warn(
        `SNS message ${snsMessageId} has unsupported action type ${action?.type}`,
      );
    }

    return {
      recipients: notification.receipt?.recipients ?? [],
      subject: notification.mail?.commonHeaders?.subject ?? null,
      message,
      dedupeKey: snsMessageId,
    };
  }
}
