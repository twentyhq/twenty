import { Injectable } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Injectable()
export class MessagingCursorService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async updateCursor(
    messageChannel: MessageChannelWorkspaceEntity,
    nextSyncCursor: string,
    workspaceId: string,
    folderId?: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );
        const folderRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
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
      },
    );
  }
}
