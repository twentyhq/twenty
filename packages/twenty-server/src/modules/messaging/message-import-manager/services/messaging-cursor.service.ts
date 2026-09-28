import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { isSyncCursorNewer } from 'src/modules/messaging/message-import-manager/utils/is-sync-cursor-newer.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class MessagingCursorService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectWorkspaceScopedRepository(MessageFolderEntity)
    private readonly messageFolderRepository: WorkspaceScopedRepository<MessageFolderEntity>,
  ) {}

  public async updateCursor(
    messageChannel: MessageChannelEntity,
    nextSyncCursor: string,
    workspaceId: string,
    folderId?: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        if (!folderId) {
          await this.messageChannelRepository.update(
            { id: messageChannel.id, workspaceId },
            {
              throttleFailureCount: 0,
              throttleRetryAfter: null,
              syncStageStartedAt: null,
              syncCursor: isSyncCursorNewer(
                nextSyncCursor,
                messageChannel.syncCursor,
              )
                ? nextSyncCursor
                : messageChannel.syncCursor,
            },
          );
        } else {
          await this.messageFolderRepository.update(
            workspaceId,
            { id: folderId },
            {
              syncCursor: nextSyncCursor,
            },
          );
          await this.messageChannelRepository.update(
            { id: messageChannel.id, workspaceId },
            {
              throttleFailureCount: 0,
              throttleRetryAfter: null,
              syncStageStartedAt: null,
            },
          );
        }
      },
      authContext,
      { lite: true },
    );
  }
}
