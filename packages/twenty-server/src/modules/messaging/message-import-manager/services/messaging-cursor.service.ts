import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessageImportException,
  MessageImportExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/message-import.exception';

@Injectable()
export class MessagingCursorService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  public async getCursor(
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    folderId?: string,
  ): Promise<string> {
    const folderRepository =
      await this.twentyORMManager.getRepository<MessageFolderWorkspaceEntity>(
        'messageFolder',
      );

    switch (connectedAccount.provider) {
      case 'google':
        return messageChannel.syncCursor;
      case 'microsoft': {
        const folder = await folderRepository.findOne({
          where: {
            id: folderId,
          },
        });

        if (!folder) {
          throw new MessageImportException(
            `Folder is required to get cursor for ${connectedAccount.provider}`,
            MessageImportExceptionCode.FOLDER_ID_REQUIRED,
          );
        }

        return folder.syncCursor;
      }

      default:
        throw new MessageImportException(
          `Update Cursor for provider ${connectedAccount.provider} not implemented`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }

  public async updateCursor(
    messageChannel: MessageChannelWorkspaceEntity,
    nextSyncCursor: string,
    folderId?: string,
  ) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );
    const folderRepository =
      await this.twentyORMManager.getRepository<MessageFolderWorkspaceEntity>(
        'messageFolder',
      );

    if (!folderId) {
      await messageChannelRepository.update(
        {
          id: messageChannel.id,
        },
        {
          throttleFailureCount: 0,
          syncStageStartedAt: null,
          syncCursor:
            !messageChannel.syncCursor ||
            nextSyncCursor > messageChannel.syncCursor
              ? nextSyncCursor
              : messageChannel.syncCursor,
        },
      );
    } else {
      await folderRepository.update(
        {
          id: folderId,
        },
        {
          syncCursor: nextSyncCursor,
        },
      );
      await messageChannelRepository.update(
        {
          id: messageChannel.id,
        },
        {
          throttleFailureCount: 0,
          syncStageStartedAt: null,
        },
      );
    }
  }
}
