import { Module } from '@nestjs/common';

import { ConnectedAccountSyncWebhooksController } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhooks.controller';
import { GoogleWebhookDriverModule } from 'src/modules/connected-account-sync-webhooks/drivers/google/google-webhook-driver.module';
import { MicrosoftWebhookDriverModule } from 'src/modules/connected-account-sync-webhooks/drivers/microsoft/microsoft-webhook-driver.module';

@Module({
  imports: [GoogleWebhookDriverModule, MicrosoftWebhookDriverModule],
  controllers: [ConnectedAccountSyncWebhooksController],
})
export class ConnectedAccountSyncWebhooksModule {}
