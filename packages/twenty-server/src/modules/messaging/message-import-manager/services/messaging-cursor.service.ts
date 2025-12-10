import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Injectable()
export class MessagingCursorService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async updateCursor(
    messageChannel: MessageChannelWorkspaceEntity,
    nextSyncCursor: string,
    workspaceId: string,
    folderId?: string,
  ) {
    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );
    const folderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
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
