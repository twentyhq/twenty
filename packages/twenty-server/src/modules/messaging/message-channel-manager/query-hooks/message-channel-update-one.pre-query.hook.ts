import { msg } from '@lingui/core/macro';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageChannelPendingGroupEmailsAction,
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

@WorkspaceQueryHook(`messageChannel.updateOne`)
export class MessageChannelUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<MessageChannelWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<MessageChannelWorkspaceEntity>> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspace.id,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: { id: payload.id },
    });

    if (!messageChannel) {
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

    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspace.id,
        'messageFolder',
      );

    const messageFolders = await messageFolderRepository.find({
      where: { messageChannelId: messageChannel.id },
    });

    const hasPendingFolderActions = messageFolders.some(
      (folder) =>
        folder.pendingSyncAction !== MessageFolderPendingSyncAction.NONE,
    );

    const hasPendingGroupEmailsAction =
      messageChannel.pendingGroupEmailsAction !==
      MessageChannelPendingGroupEmailsAction.NONE;

    if (
      isSyncOngoing &&
      (hasPendingFolderActions || hasPendingGroupEmailsAction)
    ) {
      throw new WorkspaceQueryRunnerException(
        'Cannot update message channel while sync is ongoing with pending actions',
        WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Cannot update message channel while sync is ongoing. Please wait for the sync to complete.`,
        },
      );
    }

    return payload;
  }
}
