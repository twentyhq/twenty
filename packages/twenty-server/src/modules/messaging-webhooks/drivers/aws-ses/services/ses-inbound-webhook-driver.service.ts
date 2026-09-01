import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { SnsEnvelopeService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/sns-envelope.service';
import { type SesInboundNotification } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/sns-message.type';
import { InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { type NormalizedInboundMailNotification } from 'src/modules/messaging-webhooks/types/normalized-inbound-mail-notification.type';
import { INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-message-source.constant';
import { type InboundEmailMessageReference } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-reference.type';

@Injectable()
export class SesInboundWebhookDriverService {
  private readonly logger = new Logger(SesInboundWebhookDriverService.name);

  constructor(
    private readonly snsEnvelopeService: SnsEnvelopeService,
    private readonly inboundMailHandlerService: InboundMailHandlerService,
  ) {}

  async handle(rawBody: Buffer): Promise<void> {
    const envelope =
      await this.snsEnvelopeService.openNotification<SesInboundNotification>(
        rawBody,
      );

    if (!isDefined(envelope)) {
      return;
    }

    const { notification, messageId } = envelope;

    await this.inboundMailHandlerService.handle(
      this.normalizeNotification(notification, messageId),
    );
  }

  private normalizeNotification(
    notification: SesInboundNotification,
    snsMessageId: string,
  ): NormalizedInboundMailNotification {
    const action = notification.receipt?.action;
    const recipients = notification.receipt?.recipients ?? [];
    const subject = notification.mail?.commonHeaders?.subject ?? null;

    if (action?.type !== 'S3') {
      this.logger.warn(
        `SNS message ${snsMessageId} has unsupported action type ${action?.type}`,
      );

      return { recipients, subject, message: null, dedupeKey: snsMessageId };
    }

    const message: InboundEmailMessageReference = {
      source: INBOUND_EMAIL_MESSAGE_SOURCE.SES_S3,
      reference: action.objectKey,
    };

    return { recipients, subject, message, dedupeKey: snsMessageId };
  }
}
