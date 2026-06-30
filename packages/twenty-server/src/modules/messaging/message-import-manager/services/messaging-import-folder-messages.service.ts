import { Injectable } from '@nestjs/common';

import {
  ConnectedAccountProvider,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';

@Injectable()
export class MessagingImportFolderMessagesService {
  constructor(
    private readonly gmailGetMessageListService: GmailGetMessageListService,
  ) {}

  async getFolderMessageIdsToImport(
    messageChannel: MessageChannelEntity,
    messageFolder: MessageFolderEntity,
  ): Promise<string[]> {
    switch (messageChannel.connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE: {
        const foldersScopedToImportedFolder = messageChannel.messageFolders.map(
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
            foldersScopedToImportedFolder,
            {
              messageFolderImportPolicy:
                MessageFolderImportPolicy.SELECTED_FOLDERS,
            },
          );

        return messageList?.messageExternalIds ?? [];
      }
      default:
        return [];
    }
  }
}
