import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingMessageWebhookSyncJob } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/jobs/messaging-message-webhook-sync.job';
import { MessagingMessageWebhookSyncService } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/services/messaging-message-webhook-sync.service';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

@Module({
  imports: [
    MessagingImportManagerModule,
    TypeOrmModule.forFeature([MessageChannelEntity]),
  ],
  providers: [
    MessagingMessageWebhookSyncService,
    MessagingMessageWebhookSyncJob,
  ],
})
export class MessagingMessageWebhookSyncModule {}
