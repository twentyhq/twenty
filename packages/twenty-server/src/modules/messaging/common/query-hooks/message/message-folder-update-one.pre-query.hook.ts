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
import { computePendingSyncActionForFolderUpdate } from 'src/modules/messaging/common/query-hooks/message/utils/compute-message-folder-update-payload.util';
import {
  MessageChannelSyncStage,
  MessageFolderImportPolicy,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

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
      async () => {
        const messageFolderRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
            workspace.id,
            'messageFolder',
          );

        const messageFolderWithMessageChannel =
          await messageFolderRepository.findOne({
            where: { id: payload.id },
            relations: ['messageChannel'],
          });

        if (!isDefined(messageFolderWithMessageChannel)) {
          throw new WorkspaceQueryRunnerException(
            'Message folder not found',
            WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
            {
              userFriendlyMessage: msg`Message folder not found`,
            },
          );
        }

        if (
          messageFolderWithMessageChannel.messageChannel.syncStage ===
          MessageChannelSyncStage.PENDING_CONFIGURATION
        ) {
          return payload;
        }

        const isSyncedChanging =
          isDefined(payload.data.isSynced) &&
          payload.data.isSynced !== messageFolderWithMessageChannel.isSynced;

        if (
          isSyncedChanging &&
          messageFolderWithMessageChannel.messageChannel
            .messageFolderImportPolicy === MessageFolderImportPolicy.ALL_FOLDERS
        ) {
          throw new WorkspaceQueryRunnerException(
            'Cannot toggle folder sync when import policy is ALL_FOLDERS',
            WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            {
              userFriendlyMessage: msg`Cannot toggle individual folder sync when all folders are synced.`,
            },
          );
        }

        if (isSyncedChanging) {
          const pendingSyncAction = computePendingSyncActionForFolderUpdate(
            messageFolderWithMessageChannel,
            payload.data.isSynced,
          );

          this.logger.log(
            `MessageFolderId: ${messageFolderWithMessageChannel.id} - Setting pendingSyncAction to ${pendingSyncAction}`,
          );

          payload.data.pendingSyncAction = pendingSyncAction;
        }

        return payload;
      },
      systemAuthContext,
    );
  }
}
