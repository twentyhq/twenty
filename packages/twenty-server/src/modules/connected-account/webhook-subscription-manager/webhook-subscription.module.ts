import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { CreateWebhookSubscriptionForConnectedAccountCommand } from 'src/modules/connected-account/webhook-subscription-manager/commands/create-webhook-subscription-for-connected-account.command';
import { WebhookSubscriptionRenewalCronCommand } from 'src/modules/connected-account/webhook-subscription-manager/crons/commands/webhook-subscription-renewal.cron.command';
import { CreateWebhookSubscriptionJob } from 'src/modules/connected-account/webhook-subscription-manager/jobs/create-webhook-subscription.job';
import { RenewWebhookSubscriptionJob } from 'src/modules/connected-account/webhook-subscription-manager/jobs/renew-webhook-subscription.job';
import { WebhookSubscriptionRenewalCronJob } from 'src/modules/connected-account/webhook-subscription-manager/crons/jobs/webhook-subscription-renewal.cron.job';
import { WebhookSubscriptionChannelDeletedListener } from 'src/modules/connected-account/webhook-subscription-manager/listeners/webhook-subscription-channel-deleted.listener';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';
import { WebhookSubscriptionManagerModule } from 'src/modules/connected-account/webhook-subscription-manager/webhook-subscription-manager.module';

@Module({
  imports: [
    WebhookSubscriptionManagerModule,
    FeatureFlagModule,
    WorkspaceIteratorModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
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
    CreateWebhookSubscriptionJob,
    RenewWebhookSubscriptionJob,
    CreateWebhookSubscriptionForConnectedAccountCommand,
  ],
  exports: [
    MessagingWebhookSubscriptionService,
    CalendarWebhookSubscriptionService,
    WebhookSubscriptionRenewalCronCommand,
  ],
})
export class WebhookSubscriptionModule {}
