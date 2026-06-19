import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WebhookSubscriptionModule } from 'src/modules/connected-account/webhook-subscription-manager/webhook-subscription.module';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import { ConnectedAccountSyncWebhooksController } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhooks.controller';
import { GooglePushAuthGuard } from 'src/modules/connected-account-sync-webhooks/guards/google-push-auth.guard';
import { GooglePubSubPushVerifierService } from 'src/modules/connected-account-sync-webhooks/services/google-pubsub-push-verifier.service';
import { GoogleWebhookService } from 'src/modules/connected-account-sync-webhooks/services/google-webhook.service';
import { MicrosoftWebhookService } from 'src/modules/connected-account-sync-webhooks/services/microsoft-webhook.service';

@Module({
  imports: [
    TwentyConfigModule,
    WebhookSubscriptionModule,
    TypeOrmModule.forFeature([
      ConnectedAccountWebhookSubscriptionEntity,
      ConnectedAccountEntity,
      MessageChannelEntity,
      CalendarChannelEntity,
    ]),
  ],
  controllers: [ConnectedAccountSyncWebhooksController],
  providers: [
    GooglePubSubPushVerifierService,
    GooglePushAuthGuard,
    GoogleWebhookService,
    MicrosoftWebhookService,
    WebhookSyncTriggerService,
  ],
})
export class ConnectedAccountSyncWebhooksModule {}
