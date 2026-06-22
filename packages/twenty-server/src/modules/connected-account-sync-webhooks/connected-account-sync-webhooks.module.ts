import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WebhookSubscriptionModule } from 'src/modules/connected-account/webhook-subscription-manager/webhook-subscription.module';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';
import { ConnectedAccountSyncWebhooksController } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhooks.controller';
import { GoogleCalendarNotificationHandler } from 'src/modules/connected-account-sync-webhooks/handlers/google-calendar-notification.handler';
import { GoogleMessagingNotificationHandler } from 'src/modules/connected-account-sync-webhooks/handlers/google-messaging-notification.handler';
import { MicrosoftCalendarNotificationHandler } from 'src/modules/connected-account-sync-webhooks/handlers/microsoft-calendar-notification.handler';
import { MicrosoftMessagingNotificationHandler } from 'src/modules/connected-account-sync-webhooks/handlers/microsoft-messaging-notification.handler';

@Module({
  imports: [
    TwentyConfigModule,
    WebhookSubscriptionModule,
    TypeOrmModule.forFeature([
      ConnectedAccountEntity,
      MessageChannelEntity,
      CalendarChannelEntity,
    ]),
  ],
  controllers: [ConnectedAccountSyncWebhooksController],
  providers: [
    GoogleMessagingNotificationHandler,
    GoogleCalendarNotificationHandler,
    MicrosoftMessagingNotificationHandler,
    MicrosoftCalendarNotificationHandler,
    WebhookSyncTriggerService,
  ],
})
export class ConnectedAccountSyncWebhooksModule {}
