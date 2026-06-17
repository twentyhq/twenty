import { Injectable, Logger } from '@nestjs/common';

import { MessageFolderImportPolicy } from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';

@Injectable()
export class MessagingGmailFolderBackfillService {
  private readonly logger = new Logger(
    MessagingGmailFolderBackfillService.name,
  );

  constructor(
    private readonly gmailGetMessageListService: GmailGetMessageListService,
  ) {}

  async getFolderMessageIdsToImport(
    messageChannel: MessageChannelEntity,
    messageFolder: MessageFolderEntity,
    workspaceId: string,
  ): Promise<string[]> {
    const messageFoldersScopedToImport = messageChannel.messageFolders.map(
      (folder) => ({
        name: folder.name,
        externalId: folder.externalId,
        parentFolderId: folder.parentFolderId,
        isSynced: folder.id === messageFolder.id,
      }),
    );

    const [messageList] =
      await this.gmailGetMessageListService.getMessageListWithoutCursor(
        messageChannel.connectedAccount,
        messageFoldersScopedToImport,
        {
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
      );

    const messageExternalIds = messageList?.messageExternalIds ?? [];

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Collected ${messageExternalIds.length} message(s) for backfill import`,
    );

    return messageExternalIds;
  }
}
