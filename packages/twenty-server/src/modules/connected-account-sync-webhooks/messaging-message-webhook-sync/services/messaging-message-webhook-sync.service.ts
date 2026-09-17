import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageChannelSyncStage } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessagingMessageWebhookSyncJobData } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/types/messaging-message-webhook-sync-job-data.type';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';

@Injectable()
export class MessagingMessageWebhookSyncService {
  private readonly logger = new Logger(MessagingMessageWebhookSyncService.name);

  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly messagingMessageListFetchService: MessagingMessageListFetchService,
  ) {}

  async processMessagingMessageWebhookSync({
    messageChannelId,
    workspaceId,
  }: MessagingMessageWebhookSyncJobData): Promise<void> {
    const isMessageChannelScheduled =
      await this.markMessageChannelAsListFetchScheduledIfPending({
        messageChannelId,
        workspaceId,
      });

    if (!isMessageChannelScheduled) {
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
    );
  }

  private async markMessageChannelAsListFetchScheduledIfPending({
    messageChannelId,
    workspaceId,
  }: MessagingMessageWebhookSyncJobData): Promise<boolean> {
    const updateResult = await this.messageChannelRepository
      .createQueryBuilder()
      .update()
      .set({
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
        syncStageStartedAt: new Date(),
      })
      .where({
        id: messageChannelId,
        workspaceId,
        isSyncEnabled: true,
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      })
      .returning('id')
      .execute();

    return updateResult.raw.length > 0;
  }
}
