import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import { WebhookSubscriptionModule } from 'src/modules/connected-account/webhook-subscription-manager/webhook-subscription.module';
import { MicrosoftCalendarNotificationHandler } from 'src/modules/connected-account-sync-webhooks/drivers/microsoft/microsoft-calendar-notification.handler';
import { MicrosoftMessagingNotificationHandler } from 'src/modules/connected-account-sync-webhooks/drivers/microsoft/microsoft-messaging-notification.handler';

@Module({
  imports: [
    MetricsModule,
    TwentyConfigModule,
    WebhookSubscriptionModule,
    TypeOrmModule.forFeature([MessageChannelEntity, CalendarChannelEntity]),
  ],
  providers: [
    MicrosoftMessagingNotificationHandler,
    MicrosoftCalendarNotificationHandler,
    WebhookSyncTriggerService,
  ],
  exports: [
    MicrosoftMessagingNotificationHandler,
    MicrosoftCalendarNotificationHandler,
  ],
})
export class MicrosoftWebhookDriverModule {}
