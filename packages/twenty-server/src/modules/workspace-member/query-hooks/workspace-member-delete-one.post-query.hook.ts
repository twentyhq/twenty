import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { RecordShareOwnershipTransferService } from 'src/engine/core-modules/record-share/services/record-share-ownership-transfer.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { ConnectedAccountOwnershipTransferService } from 'src/engine/metadata-modules/connected-account/services/connected-account-ownership-transfer.service';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceQueryHook({
  key: `workspaceMember.deleteOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkspaceMemberDeleteOnePostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly connectedAccountOwnershipTransferService: ConnectedAccountOwnershipTransferService,
    private readonly recordShareOwnershipTransferService: RecordShareOwnershipTransferService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly agentChatThreadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: WorkspaceMemberWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload.length === 0) {
      return;
    }

    const deletedWorkspaceMember = payload[0];
    const targettedWorkspaceMemberId = deletedWorkspaceMember.id;

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return workspaceMemberRepository.findOne({
          where: {
            id: targettedWorkspaceMemberId,
          },
          withDeleted: true,
        });
      }, authContext);

    if (!isDefined(workspaceMember)) {
      throw new PermissionsException(
        'Workspace member not found',
        PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspaceId: workspace.id,
        userId: workspaceMember.userId,
      },
    });

    if (!isDefined(userWorkspace)) {
      throw new PermissionsException(
        'User workspace not found',
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    await this.connectedAccountOwnershipTransferService.transferConnectedAccountsOwnershipToCustodian(
      {
        removedUserWorkspace: userWorkspace,
        actingUserWorkspaceId:
          'userWorkspaceId' in authContext
            ? authContext.userWorkspaceId
            : undefined,
      },
    );

    await this.recordShareOwnershipTransferService.transferRecordSharesToCustodian(
      {
        removedUserWorkspace: userWorkspace,
        removedWorkspaceMemberId: workspaceMember.id,
        actingUserWorkspaceId:
          'userWorkspaceId' in authContext
            ? authContext.userWorkspaceId
            : undefined,
      },
    );

    await this.userWorkspaceService.deleteUserWorkspace({
      userWorkspaceId: userWorkspace.id,
      workspaceId: workspace.id,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspace.id, [
      'flatWorkspaceMemberMaps',
    ]);

    // After the membership is gone, so a failed removal keeps the history and racing threads are cleaned too
    await this.removeAgentChatThreads({
      workspaceId: workspace.id,
      workspaceMemberId: workspaceMember.id,
    });
  }

  // A chat in a channel is the channel's, so it stays there without an owner.
  // The member leaves their channels, along with the grants they read through
  private async removeAgentChatThreads({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    if (
      !isDefined(
        findAgentChatFlatObjectMetadata(
          flatObjectMetadataMaps,
          'agentChatChannel',
        ),
      )
    ) {
      await this.agentChatThreadRepository.delete(workspaceId, {
        workspaceMemberId,
      });

      return;
    }

    const { memberTable, recordShareTable } =
      getAgentChatChannelTables(workspaceId);

    await this.agentChatThreadRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        await manager.query(
          `UPDATE ${table('agentChatThread')}
           SET "workspaceMemberId" = NULL, "userWorkspaceId" = NULL, "updatedAt" = now()
           WHERE "workspaceMemberId" = $1 AND "channelId" IS NOT NULL`,
          [workspaceMemberId],
        );
        await manager.query(
          `DELETE FROM ${table('agentChatThread')}
           WHERE "workspaceMemberId" = $1 AND "channelId" IS NULL`,
          [workspaceMemberId],
        );
        await manager.query(
          `WITH removed_membership AS (
             DELETE FROM ${memberTable} WHERE "workspaceMemberId" = $1
             RETURNING id
           )
           DELETE FROM ${recordShareTable}
           WHERE "rowCause" = 'RULE'
             AND "sourceId" IN (SELECT id FROM removed_membership)`,
          [workspaceMemberId],
        );
      },
    );
  }
}
