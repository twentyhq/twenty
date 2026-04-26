import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

@Injectable()
export class MessagingCursorService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(MessageFolderEntity)
    private readonly messageFolderRepository: Repository<MessageFolderEntity>,
  ) {}

  public async updateCursor(
    messageChannel: MessageChannelEntity,
    nextSyncCursor: string,
    workspaceId: string,
    folderId?: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      let extraFields = {};

      try {
        const parsed = JSON.parse(nextSyncCursor);

        extraFields = {
          highestUid: parsed.highestUid,
          uidValidity: parsed.uidValidity,
          modSeq: parsed.modSeq,
          firstSyncedUid: parsed.firstSyncedUid,
        };
      } catch {
        // Not JSON, ignore extra fields
      }

      if (!folderId) {
        await this.messageChannelRepository.update(
          { id: messageChannel.id, workspaceId },
          {
            throttleFailureCount: 0,
            throttleRetryAfter: null,
            syncStageStartedAt: null,
            syncCursor:
              !messageChannel.syncCursor ||
              nextSyncCursor > messageChannel.syncCursor
                ? nextSyncCursor
                : messageChannel.syncCursor,
            ...extraFields,
          },
        );
      } else {
        await this.messageFolderRepository.update(
          { id: folderId, workspaceId },
          {
            syncCursor: nextSyncCursor,
            ...extraFields,
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
    }, authContext);
  }
}
