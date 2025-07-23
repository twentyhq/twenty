import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Injectable()
export class MessagingCursorService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

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
