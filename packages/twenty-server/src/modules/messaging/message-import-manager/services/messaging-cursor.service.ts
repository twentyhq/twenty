import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
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
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

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

  public async processCursorUpdate(
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
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

    switch (connectedAccount.provider) {
      case 'google':
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
        break;
      case 'microsoft':
        if (!folderId) {
          throw new MessageImportException(
            `Folder ID is required to update cursor for ${connectedAccount.provider}`,
            MessageImportExceptionCode.FOLDER_ID_REQUIRED,
          );
        }
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
        break;

      default:
        throw new MessageImportException(
          `Update Cursor for provider ${connectedAccount.provider} not implemented`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
