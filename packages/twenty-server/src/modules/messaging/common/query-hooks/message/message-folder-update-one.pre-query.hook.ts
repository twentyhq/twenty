import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

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
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  type MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

const ONGOING_SYNC_STAGES = [
  MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
  MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
];

@WorkspaceQueryHook(`messageFolder.updateOne`)
export class MessageFolderUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(MessageFolderUpdateOnePreQueryHook.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<MessageFolderWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<MessageFolderWorkspaceEntity>> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const systemAuthContext = buildSystemAuthContext(workspace.id);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      systemAuthContext,
      async () => {
        const messageFolderRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
            workspace.id,
            'messageFolder',
          );

        const messageFolder = await messageFolderRepository.findOne({
          where: { id: payload.id },
        });

        if (!isDefined(messageFolder)) {
          throw new WorkspaceQueryRunnerException(
            'Message folder not found',
            WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
            {
              userFriendlyMessage: msg`Message folder not found`,
            },
          );
        }

        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspace.id,
            'messageChannel',
          );

        const messageChannel = await messageChannelRepository.findOne({
          where: { id: messageFolder.messageChannelId },
        });

        if (!isDefined(messageChannel)) {
          throw new WorkspaceQueryRunnerException(
            'Message channel not found',
            WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
            {
              userFriendlyMessage: msg`Message channel not found`,
            },
          );
        }

        const isSyncOngoing = ONGOING_SYNC_STAGES.includes(
          messageChannel.syncStage,
        );

        const hasPendingFolderAction =
          messageFolder.pendingSyncAction !==
          MessageFolderPendingSyncAction.NONE;

        const isSyncedFieldChanging = isDefined(payload.data.isSynced);

        if (isSyncedFieldChanging && isSyncOngoing) {
          throw new WorkspaceQueryRunnerException(
            'Cannot update message folder while sync is ongoing',
            WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            {
              userFriendlyMessage: msg`Cannot update folder while sync is ongoing. Please wait for the sync to complete.`,
            },
          );
        }

        if (isSyncedFieldChanging && hasPendingFolderAction) {
          throw new WorkspaceQueryRunnerException(
            'Cannot update message folder while it has a pending action',
            WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            {
              userFriendlyMessage: msg`Cannot update folder while it has a pending action. Please wait for the action to complete.`,
            },
          );
        }

        const hasCompletedConfiguration =
          messageChannel.syncStage !==
          MessageChannelSyncStage.PENDING_CONFIGURATION;

        if (!hasCompletedConfiguration) {
          this.logger.log(
            `MessageFolderId: ${messageFolder.id} - Skipping pending action for folder in PENDING_CONFIGURATION state`,
          );

          return payload;
        }

        if (!isSyncedFieldChanging) {
          return payload;
        }

        const isSyncedChangingToTrue =
          payload.data.isSynced === true && messageFolder.isSynced === false;

        if (isSyncedChangingToTrue) {
          this.logger.log(
            `MessageFolderId: ${messageFolder.id} - Setting FOLDER_IMPORT pending action for folder being enabled`,
          );

          return {
            ...payload,
            data: {
              ...payload.data,
              pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
            },
          };
        }

        const isSyncedChangingToFalse =
          payload.data.isSynced === false && messageFolder.isSynced === true;

        if (isSyncedChangingToFalse) {
          this.logger.log(
            `MessageFolderId: ${messageFolder.id} - Setting FOLDER_DELETION pending action for folder being disabled`,
          );

          return {
            ...payload,
            data: {
              ...payload.data,
              pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
            },
          };
        }

        return payload;
      },
    );
  }
}
