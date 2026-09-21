import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MESSAGING_MESSAGE_WEBHOOK_SYNC_INLINE_IMPORT_MAX_MESSAGES } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/constants/messaging-message-webhook-sync-inline-import-max-messages.constant';
import { type MessagingMessageWebhookSyncJobData } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/types/messaging-message-webhook-sync-job-data.type';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';

@Injectable()
export class MessagingMessageWebhookSyncService {
  private readonly logger = new Logger(MessagingMessageWebhookSyncService.name);

  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly messagingMessageListFetchService: MessagingMessageListFetchService,
  ) {}

  async processMessagingMessageWebhookSync({
    messageChannelId,
    workspaceId,
  }: MessagingMessageWebhookSyncJobData): Promise<void> {
    const [scheduledMessageChannelId] =
      await this.messageChannelSyncStatusService.markAsMessagesListFetchScheduledIfPending(
        [messageChannelId],
        workspaceId,
      );

    if (!isDefined(scheduledMessageChannelId)) {
      this.logger.log(
        `Skipping webhook sync for message channel ${messageChannelId}, a sync is already in progress`,
      );

      return;
    }

    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId, workspaceId, isSyncEnabled: true },
      relations: { connectedAccount: true, messageFolders: true },
    });

    if (!isDefined(messageChannel)) {
      return;
    }

    await this.messagingMessageListFetchService.processMessageListFetch(
      messageChannel,
      workspaceId,
      MESSAGING_MESSAGE_WEBHOOK_SYNC_INLINE_IMPORT_MAX_MESSAGES,
    );
  }
}
