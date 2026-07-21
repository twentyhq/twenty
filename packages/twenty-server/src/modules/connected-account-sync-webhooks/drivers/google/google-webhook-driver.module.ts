import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import { WebhookSubscriptionModule } from 'src/modules/connected-account/webhook-subscription-manager/webhook-subscription.module';
import { GoogleCalendarNotificationHandler } from 'src/modules/connected-account-sync-webhooks/drivers/google/google-calendar-notification.handler';
import { GoogleMessagingNotificationHandler } from 'src/modules/connected-account-sync-webhooks/drivers/google/google-messaging-notification.handler';

@Module({
  imports: [
    MetricsModule,
    TwentyConfigModule,
    WebhookSubscriptionModule,
    TypeOrmModule.forFeature([
      ConnectedAccountEntity,
      MessageChannelEntity,
      CalendarChannelEntity,
    ]),
  ],
  providers: [
    GoogleMessagingNotificationHandler,
    GoogleCalendarNotificationHandler,
    WebhookSyncTriggerService,
  ],
  exports: [
    GoogleMessagingNotificationHandler,
    GoogleCalendarNotificationHandler,
  ],
})
export class GoogleWebhookDriverModule {}
