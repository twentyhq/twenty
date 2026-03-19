import { Injectable } from '@nestjs/common';

import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Injectable()
export class MessagingCursorService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
  ) {}

  public async updateCursor(
    messageChannel: MessageChannelWorkspaceEntity,
    nextSyncCursor: string,
    workspaceId: string,
    folderId?: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const folderRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
          workspaceId,
          'messageFolder',
        );

      if (!folderId) {
        await this.messageChannelDataAccessService.update(
          workspaceId,
          {
            id: messageChannel.id,
          },
          {
            throttleFailureCount: 0,
            throttleRetryAfter: null,
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
        await this.messageChannelDataAccessService.update(
          workspaceId,
          {
            id: messageChannel.id,
          },
          {
            throttleFailureCount: 0,
            throttleRetryAfter: null,
            syncStageStartedAt: null,
          },
        );
      }
    }, authContext);
  }
}
