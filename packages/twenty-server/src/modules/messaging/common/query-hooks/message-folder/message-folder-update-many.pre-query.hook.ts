import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { In, Not } from 'typeorm';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  type MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

const ONGOING_SYNC_STAGES = [MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING];

@WorkspaceQueryHook(`messageFolder.updateMany`)
export class MessageFolderUpdateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(
    MessageFolderUpdateManyPreQueryHook.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateManyResolverArgs<MessageFolderWorkspaceEntity>,
  ): Promise<UpdateManyResolverArgs<MessageFolderWorkspaceEntity>> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    if (!isDefined(payload.data.isSynced) || payload.data.isSynced !== true) {
      return payload;
    }

    const systemAuthContext = buildSystemAuthContext(workspace.id);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      systemAuthContext,
      async () => {
        const messageFolderRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
            workspace.id,
            'messageFolder',
          );

        const foldersToUpdate = await messageFolderRepository.find({
          where: {
            ...payload.filter,
            isSynced: false,
          },
        });

        if (foldersToUpdate.length === 0) {
          return payload;
        }

        const foldersByChannel = new Map<
          string,
          MessageFolderWorkspaceEntity[]
        >();

        for (const folder of foldersToUpdate) {
          const channelId = folder.messageChannelId;
          const existing = foldersByChannel.get(channelId) ?? [];

          existing.push(folder);
          foldersByChannel.set(channelId, existing);
        }

        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspace.id,
            'messageChannel',
          );

        for (const [channelId, folders] of foldersByChannel) {
          const messageChannel = await messageChannelRepository.findOne({
            where: { id: channelId },
          });

          if (!isDefined(messageChannel)) {
            this.logger.warn(
              `Message channel ${channelId} not found, skipping folders`,
            );
            continue;
          }

          const isSyncOngoing = ONGOING_SYNC_STAGES.includes(
            messageChannel.syncStage,
          );

          const messageFoldersWithPendingActionCount =
            await messageFolderRepository.count({
              where: {
                messageChannelId: messageChannel.id,
                pendingSyncAction: Not(MessageFolderPendingSyncAction.NONE),
              },
            });

          const hasPendingFolderActions =
            messageFoldersWithPendingActionCount > 0;

          const hasPendingGroupEmailsAction =
            messageChannel.pendingGroupEmailsAction !==
            MessageChannelPendingGroupEmailsAction.NONE;

          if (
            isSyncOngoing &&
            (hasPendingFolderActions || hasPendingGroupEmailsAction)
          ) {
            throw new WorkspaceQueryRunnerException(
              'Cannot update message folders while sync is ongoing with pending actions',
              WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              {
                userFriendlyMessage: msg`Cannot update message folders while sync is ongoing. Please wait for the sync to complete.`,
              },
            );
          }

          const hasCompletedConfiguration =
            messageChannel.syncStage !==
            MessageChannelSyncStage.PENDING_CONFIGURATION;

          if (!hasCompletedConfiguration) {
            this.logger.log(
              `MessageChannelId: ${messageChannel.id} - Skipping pending action for folders in PENDING_CONFIGURATION state`,
            );
            continue;
          }

          const folderIds = folders.map((f) => f.id);

          await messageFolderRepository.update(
            { id: In(folderIds) },
            { pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT },
          );

          this.logger.log(
            `MessageChannelId: ${messageChannel.id} - Marked ${folderIds.length} folders for FOLDER_IMPORT action`,
          );
        }

        return payload;
      },
    );
  }
}
