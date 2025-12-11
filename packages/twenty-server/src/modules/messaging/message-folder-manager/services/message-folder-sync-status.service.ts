import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageFolderImportPolicy,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';
import { getStandardFolderByRegex } from 'src/modules/messaging/message-import-manager/drivers/utils/get-standard-folder-by-regex';

@Injectable()
export class MessageFolderSyncStatusService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async updateMessageFoldersSyncStatus(
    workspaceId: string,
    messageChannelId: string,
    messageFolderIds: string[],
    isSynced: boolean,
  ): Promise<void> {
    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    if (!workspaceDataSource) {
      throw new WorkspaceQueryRunnerException(
        'Workspace data source not found',
        WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
      );
    }

    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    await workspaceDataSource.transaction(
      async (transactionManager: WorkspaceEntityManager) => {
        const messageChannel = await messageChannelRepository.findOne(
          {
            where: { id: messageChannelId },
          },
          transactionManager,
        );

        if (!messageChannel) {
          throw new WorkspaceQueryRunnerException(
            'Message channel not found',
            WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
            {
              userFriendlyMessage: msg`Message channel not found`,
            },
          );
        }

        if (
          messageChannel.messageFolderImportPolicy !==
          MessageFolderImportPolicy.SELECTED_FOLDERS
        ) {
          throw new WorkspaceQueryRunnerException(
            'Cannot modify folders when import policy is not selected folders',
            WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            {
              userFriendlyMessage: msg`Cannot modify folders when import policy is not selected folders`,
            },
          );
        }

        const foldersToToggle = await messageFolderRepository.find(
          {
            where: { id: In(messageFolderIds), messageChannelId },
          },
          transactionManager,
        );

        if (!isSynced) {
          const totalSyncedCount = await messageFolderRepository.count(
            {
              where: {
                messageChannelId,
                isSynced: true,
              },
            },
            transactionManager,
          );

          const foldersBeingUnsynced = foldersToToggle.filter(
            (folder) => folder.isSynced,
          ).length;

          const remainingSynced = totalSyncedCount - foldersBeingUnsynced;

          if (
            isDefined(totalSyncedCount) &&
            isNumber(totalSyncedCount) &&
            remainingSynced < 1
          ) {
            if (messageFolderIds.length > 1) {
              const priorityFolder = foldersToToggle.find((folder) => {
                if (!folder.name || !folder.isSynced) return false;

                const standardFolder = getStandardFolderByRegex(folder.name);

                return (
                  standardFolder === StandardFolder.INBOX ||
                  standardFolder === StandardFolder.SENT
                );
              });

              if (priorityFolder) {
                const foldersToUnsync = messageFolderIds.filter(
                  (folderId) => folderId !== priorityFolder.id,
                );

                await messageFolderRepository.update(
                  { id: In(foldersToUnsync) },
                  { isSynced: false },
                  transactionManager,
                );

                return;
              }
            }

            throw new WorkspaceQueryRunnerException(
              'Cannot unsync folders: at least one folder must remain synced',
              WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              {
                userFriendlyMessage: msg`At least one folder must be synced.`,
              },
            );
          }
        }

        await messageFolderRepository.update(
          { id: In(messageFolderIds) },
          { isSynced },
          transactionManager,
        );
      },
    );
  }
}
