import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WebhookSubscriptionRenewalCronCommand } from 'src/modules/connected-account/webhook-subscription-manager/crons/commands/webhook-subscription-renewal.cron.command';
import { WebhookSubscriptionRenewalCronJob } from 'src/modules/connected-account/webhook-subscription-manager/crons/jobs/webhook-subscription-renewal.cron.job';
import { WebhookSubscriptionChannelDeletedListener } from 'src/modules/connected-account/webhook-subscription-manager/listeners/webhook-subscription-channel-deleted.listener';
import { WebhookSubscriptionManagerModule } from 'src/modules/connected-account/webhook-subscription-manager/webhook-subscription-manager.module';
import { WebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription.service';

@Module({
  imports: [
    WebhookSubscriptionManagerModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([
      ConnectedAccountWebhookSubscriptionEntity,
      ConnectedAccountEntity,
      MessageChannelEntity,
      CalendarChannelEntity,
    ]),
  ],
  providers: [
    WebhookSubscriptionService,
    WebhookSubscriptionChannelDeletedListener,
    WebhookSubscriptionRenewalCronJob,
    WebhookSubscriptionRenewalCronCommand,
  ],
  exports: [WebhookSubscriptionService],
})
export class WebhookSubscriptionModule {}
