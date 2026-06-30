import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WebhookSubscriptionRenewalCronCommand } from 'src/modules/connected-account/webhook-subscription-manager/crons/commands/webhook-subscription-renewal.cron.command';
import { WebhookSubscriptionRenewalCronJob } from 'src/modules/connected-account/webhook-subscription-manager/crons/jobs/webhook-subscription-renewal.cron.job';
import { WebhookSubscriptionChannelDeletedListener } from 'src/modules/connected-account/webhook-subscription-manager/listeners/webhook-subscription-channel-deleted.listener';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';
import { WebhookSubscriptionManagerModule } from 'src/modules/connected-account/webhook-subscription-manager/webhook-subscription-manager.module';

@Module({
  imports: [
    WebhookSubscriptionManagerModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([
      ConnectedAccountEntity,
      MessageChannelEntity,
      CalendarChannelEntity,
    ]),
  ],
  providers: [
    MessagingWebhookSubscriptionService,
    CalendarWebhookSubscriptionService,
    WebhookSubscriptionChannelDeletedListener,
    WebhookSubscriptionRenewalCronJob,
    WebhookSubscriptionRenewalCronCommand,
  ],
  exports: [
    MessagingWebhookSubscriptionService,
    CalendarWebhookSubscriptionService,
  ],
})
export class WebhookSubscriptionModule {}
