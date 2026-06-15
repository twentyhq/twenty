import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IsNull, type Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// Workflow-only. The email sender configured on a workflow step is either a
// connected account id (static pick) or a workspace member id (from a resolved
// workflow variable). This service detects the workspace member case and turns
// it into a connected account id. The email tools themselves always receive a
// connected account id and must not depend on this resolution.
@Injectable()
export class WorkflowEmailSenderService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  // When the sender id is a workspace member id, resolves that member's first
  // connected account. Otherwise returns the id unchanged so the regular
  // connected account flow applies.
  async resolveSenderConnectedAccountId(
    senderId: string,
    workspaceId: string,
  ): Promise<string> {
    if (!isValidUuid(senderId)) {
      return senderId;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceMember = await this.findWorkspaceMemberById(
        senderId,
        workspaceId,
      );

      if (!isDefined(workspaceMember)) {
        return senderId;
      }

      const connectedAccountId =
        await this.findFirstConnectedAccountIdByWorkspaceMember(
          workspaceMember,
          workspaceId,
        );

      if (!isDefined(connectedAccountId)) {
        throw new WorkflowStepExecutorException(
          `No connected account found for workspace member '${senderId}'`,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }

      return connectedAccountId;
    }, authContext);
  }

  private async findWorkspaceMemberById(
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity | null> {
    // Runs in a system auth context (no user role), so permission checks must be
    // bypassed to read the workspaceMember. Access stays safe because the lookup
    // is workspace-scoped at every step (member -> userWorkspace ->
    // connectedAccount) and the email actions are permission-gated upstream.
    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    return workspaceMemberRepository.findOne({
      where: { id: workspaceMemberId },
    });
  }

  private async findFirstConnectedAccountIdByWorkspaceMember(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    workspaceId: string,
  ): Promise<string | null> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
    });

    if (!isDefined(userWorkspace)) {
      return null;
    }

    // Exclude archived accounts and order deterministically so the resolved
    // sender is stable across runs rather than depending on row ordering.
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        userWorkspaceId: userWorkspace.id,
        workspaceId,
        archivedAt: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });

    return connectedAccount?.id ?? null;
  }
}
