import { Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

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
import { computePendingSyncActionForFolderUpdate } from 'src/modules/messaging/common/query-hooks/message/utils/compute-message-folder-update-payload.util';
import {
  MessageChannelSyncStage,
  MessageFolderImportPolicy,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

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
    if (!isDefined(payload.data.isSynced)) {
      return payload;
    }

    const folderIds = payload.filter?.id?.in;

    if (!Array.isArray(folderIds) || folderIds.length === 0) {
      return payload;
    }

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

        const messageFolders = await messageFolderRepository.find({
          where: { id: In(folderIds) },
          relations: ['messageChannel'],
        });

        let pendingSyncAction;

        for (const folder of messageFolders) {
          if (
            folder.messageChannel.syncStage ===
            MessageChannelSyncStage.PENDING_CONFIGURATION
          ) {
            continue;
          }

          if (payload.data.isSynced === folder.isSynced) {
            continue;
          }

          if (
            folder.messageChannel.messageFolderImportPolicy ===
            MessageFolderImportPolicy.ALL_FOLDERS
          ) {
            throw new WorkspaceQueryRunnerException(
              'Cannot toggle folder sync when import policy is ALL_FOLDERS',
              WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              {
                userFriendlyMessage: msg`Cannot toggle individual folder sync when all folders are synced.`,
              },
            );
          }

          pendingSyncAction = computePendingSyncActionForFolderUpdate(
            folder,
            payload.data.isSynced,
          );
        }

        if (isDefined(pendingSyncAction)) {
          this.logger.log(
            `Setting pendingSyncAction to ${pendingSyncAction} for ${messageFolders.length} folders`,
          );

          payload.data.pendingSyncAction = pendingSyncAction;
        }

        return payload;
      },
      systemAuthContext,
    );
  }
}
