import { Module } from '@nestjs/common';

import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';
import { MessagingWebhooksController } from 'src/modules/messaging-webhooks/messaging-webhooks.controller';
import { SesInboundMailHandlerService } from 'src/modules/messaging-webhooks/services/ses-inbound-mail-handler.service';
import { SesInboundUnsubscribeHandlerService } from 'src/modules/messaging-webhooks/services/ses-inbound-unsubscribe-handler.service';
import { SesInboundWebhookRouterService } from 'src/modules/messaging-webhooks/services/ses-inbound-webhook-router.service';
import { SesOutboundSendingStateHandlerService } from 'src/modules/messaging-webhooks/services/ses-outbound-sending-state-handler.service';
import { SesOutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/services/ses-outbound-suppression-handler.service';
import { SesOutboundWebhookRouterService } from 'src/modules/messaging-webhooks/services/ses-outbound-webhook-router.service';
import { SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/services/sns-subscription-confirmer.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [TwentyConfigModule, EmailingDomainModule, EmailingModule],
  controllers: [MessagingWebhooksController],
  providers: [
    SnsSignatureVerifierService,
    SnsSubscriptionConfirmerService,
    SesInboundMailHandlerService,
    SesInboundUnsubscribeHandlerService,
    SesOutboundSendingStateHandlerService,
    SesOutboundSuppressionHandlerService,
    SesInboundWebhookRouterService,
    SesOutboundWebhookRouterService,
  ],
})
export class MessagingWebhooksModule {}
