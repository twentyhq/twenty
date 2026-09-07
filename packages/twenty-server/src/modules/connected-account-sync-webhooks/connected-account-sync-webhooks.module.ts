import { Module } from '@nestjs/common';

import { ConnectedAccountSyncWebhooksController } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhooks.controller';
import { CalendarEventWebhookSyncModule } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/calendar-event-webhook-sync.module';
import { GoogleWebhookDriverModule } from 'src/modules/connected-account-sync-webhooks/drivers/google/google-webhook-driver.module';
import { MicrosoftWebhookDriverModule } from 'src/modules/connected-account-sync-webhooks/drivers/microsoft/microsoft-webhook-driver.module';

@Module({
  imports: [
    GoogleWebhookDriverModule,
    MicrosoftWebhookDriverModule,
    CalendarEventWebhookSyncModule,
  ],
  controllers: [ConnectedAccountSyncWebhooksController],
})
export class ConnectedAccountSyncWebhooksModule {}
