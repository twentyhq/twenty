import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { isDefined } from 'twenty-shared/utils';

import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';

@Injectable()
export class ImapIdleListener {
  private readonly logger = new Logger(ImapIdleListener.name);

  constructor(
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
    private readonly messagingMessageListFetchService: MessagingMessageListFetchService,
  ) {}

  @OnEvent('imap.new-email')
  async handleNewEmail(payload: {
    connectedAccountId: string;
    workspaceId: string;
    folderPath: string;
  }) {
    const { connectedAccountId, workspaceId, folderPath } = payload;

    this.logger.log(
      `Received imap.new-email event for account ${connectedAccountId} in workspace ${workspaceId} on folder ${folderPath}`,
    );

    const messageChannel = await this.messageChannelDataAccessService.findOne(workspaceId, {
      where: {
        connectedAccountId,
      },
      relations: ['connectedAccount', 'messageFolders'],
    });

    if (!isDefined(messageChannel)) {
      this.logger.error(
        `Message channel not found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
      return;
    }

    try {
      await this.messagingMessageListFetchService.processMessageListFetch(
        messageChannel!,
        workspaceId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger sync after IDLE event for account ${connectedAccountId}: ${error.message}`,
      );
    }
  }
}
