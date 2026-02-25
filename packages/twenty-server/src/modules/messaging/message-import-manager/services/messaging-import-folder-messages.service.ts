import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

@Injectable()
export class MessagingImportFolderMessagesService {
  private readonly logger = new Logger(
    MessagingImportFolderMessagesService.name,
  );

  constructor(
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  async importFolderMessages(
    workspaceId: string,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'connectedAccount'
    >,
    messageFolders: Pick<MessageFolderWorkspaceEntity, 'id' | 'isSynced'>[],
  ): Promise<void> {
    const hasFoldersToImport = messageFolders.some((folder) => folder.isSynced);

    if (!hasFoldersToImport) {
      return;
    }

    switch (messageChannel.connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        await this.messageChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
          [messageChannel.id],
          workspaceId,
        );

        return;
      case ConnectedAccountProvider.MICROSOFT:
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        this.logger.debug(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Skipping folder import backfill for provider ${messageChannel.connectedAccount.provider}`,
        );

        return;
      default:
        throw new MessageImportDriverException(
          `Provider ${messageChannel.connectedAccount.provider} is not supported`,
          MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
