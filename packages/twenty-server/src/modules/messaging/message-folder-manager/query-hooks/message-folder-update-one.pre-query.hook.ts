import { msg } from '@lingui/core/macro';
import { isNumber } from '@sniptt/guards';
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
  MessageFolderImportPolicy,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@WorkspaceQueryHook(`messageFolder.updateOne`)
export class MessageFolderUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
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

        if (!messageFolder) {
          throw new WorkspaceQueryRunnerException(
            'Message folder not found',
            WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
            {
              userFriendlyMessage: msg`Message folder not found`,
            },
          );
        }

        if (payload.data.isSynced !== false) {
          return payload;
        }

        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspace.id,
            'messageChannel',
          );

        const messageChannel = await messageChannelRepository.findOne({
          where: { id: messageFolder.messageChannelId },
        });

        if (
          messageChannel?.messageFolderImportPolicy !==
          MessageFolderImportPolicy.SELECTED_FOLDERS
        ) {
          return payload;
        }

        const syncedFoldersCount = await messageFolderRepository.count({
          where: {
            messageChannelId: messageFolder.messageChannelId,
            isSynced: true,
          },
        });

        if (
          isDefined(syncedFoldersCount) &&
          isNumber(syncedFoldersCount) &&
          syncedFoldersCount <= 1
        ) {
          throw new WorkspaceQueryRunnerException(
            'Cannot unsync the last folder when folder import policy is set to selected folders',
            WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            {
              userFriendlyMessage: msg`At least one folder must be synced.`,
            },
          );
        }

        return payload;
      },
    );
  }
}
