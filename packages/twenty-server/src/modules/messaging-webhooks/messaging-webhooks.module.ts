import { Module } from '@nestjs/common';

import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';
import { ResendWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/resend/services/resend-webhook-adapter.service';
import { ResendWebhookVerifierService } from 'src/modules/messaging-webhooks/adapters/resend/services/resend-webhook-verifier.service';
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
    ResendWebhookAdapterService,
  ],
})
export class MessagingWebhooksModule {}
