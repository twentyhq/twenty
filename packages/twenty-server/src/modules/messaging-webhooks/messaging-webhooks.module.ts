import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';

import { raw } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';
import { MailgunInboundWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-inbound-webhook-adapter.service';
import { MailgunOutboundWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-outbound-webhook-adapter.service';
import { MailgunWebhookVerifierService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-webhook-verifier.service';
import { ResendWebhookDriverService } from 'src/modules/messaging-webhooks/drivers/resend/services/resend-webhook-driver.service';
import { ResendWebhookVerifierService } from 'src/modules/messaging-webhooks/drivers/resend/services/resend-webhook-verifier.service';
import { SesInboundWebhookDriverService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/ses-inbound-webhook-driver.service';
import { SesOutboundWebhookDriverService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/ses-outbound-webhook-driver.service';
import { SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/sns-subscription-confirmer.service';
import { InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { InboundUnsubscribeHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-unsubscribe-handler.service';
import { OutboundSendingStateHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-sending-state-handler.service';
import { OutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-suppression-handler.service';
import { MessagingWebhooksController } from 'src/modules/messaging-webhooks/messaging-webhooks.controller';

@Module({
  imports: [TwentyConfigModule, EmailingDomainModule, EmailingModule],
  controllers: [MessagingWebhooksController],
  providers: [
    InboundMailHandlerService,
    InboundUnsubscribeHandlerService,
    OutboundSendingStateHandlerService,
    OutboundSuppressionHandlerService,
    SnsSignatureVerifierService,
    SnsSubscriptionConfirmerService,
    SesInboundWebhookDriverService,
    SesOutboundWebhookDriverService,
    ResendWebhookVerifierService,
    ResendWebhookDriverService,
    MailgunWebhookVerifierService,
    MailgunInboundWebhookAdapterService,
    MailgunOutboundWebhookAdapterService,
  ],
})
export class MessagingWebhooksModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Mailgun store(notify) posts multipart/form-data when the stored email
    // has attachments; the global body parsers skip multipart, so capture it
    // raw for this route only. Urlencoded posts stay parsed by the global
    // parser and reach the controller as an object.
    consumer
      .apply(raw({ type: 'multipart/form-data', limit: '10mb' }))
      .forRoutes({
        path: `${ApiPath.Webhooks}/messaging/mailgun/inbound`,
        method: RequestMethod.POST,
      });
  }
}
