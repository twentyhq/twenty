import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { FieldActorSource } from 'twenty-shared/types';

import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { WorkflowRunWorkspaceService as WorkflowRunService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkflowExecutionContextService {
  private readonly logger = new Logger(WorkflowExecutionContextService.name);

  constructor(
    private readonly workflowRunService: WorkflowRunService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly userRoleService: UserRoleService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async getExecutionContext(runInfo: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<WorkflowExecutionContext> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    if (!workflowRun.createdBy) {
      throw new Error(
        'WorkflowRun createdBy field is missing - cannot determine execution context',
      );
    }

    const isActingOnBehalfOfUser =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    const { userWorkspaceId, roleId } = await this.resolveUserContext({
      workflowRun,
      isActingOnBehalfOfUser,
      runInfo,
    });

    if (!userWorkspaceId) {
      throw new Error(
        `userWorkspaceId is required but could not be determined for workflow run ${runInfo.workflowRunId}`,
      );
    }

    const rolePermissionConfig = roleId
      ? { unionOf: [roleId] }
      : { shouldBypassPermissionChecks: true as const };

    return {
      isActingOnBehalfOfUser,
      initiator: workflowRun.createdBy,
      rolePermissionConfig,
      userWorkspaceId,
    };
  }

  private async resolveUserContext({
    workflowRun,
    isActingOnBehalfOfUser,
    runInfo,
  }: {
    workflowRun: {
      createdBy: { workspaceMemberId?: string | null };
      workflowId: string;
    };
    isActingOnBehalfOfUser: boolean;
    runInfo: { workflowRunId: string; workspaceId: string };
  }): Promise<{ userWorkspaceId?: string; roleId?: string }> {
    // Determine which workspace member to use for context
    let workspaceMemberId = workflowRun.createdBy.workspaceMemberId;

    // If workflow run was triggered automatically (no user initiator),
    // use the workflow creator's workspace member
    if (!isDefined(workspaceMemberId)) {
      const workflow = await this.getWorkflow(
        workflowRun.workflowId,
        runInfo.workspaceId,
      );

      if (!workflow.createdBy?.workspaceMemberId) {
        this.logger.error(
          `Workflow ${workflowRun.workflowId} has no creator workspaceMemberId - cannot determine execution context`,
        );

        return { userWorkspaceId: undefined, roleId: undefined };
      }

      workspaceMemberId = workflow.createdBy.workspaceMemberId;
    }

    const workspaceMember =
      await this.userWorkspaceService.getWorkspaceMemberOrThrow({
        workspaceMemberId,
        workspaceId: runInfo.workspaceId,
      });

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: workspaceMember.userId,
        workspaceId: runInfo.workspaceId,
      });

    if (!isActingOnBehalfOfUser) {
      return { userWorkspaceId: userWorkspace.id, roleId: undefined };
    }

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId: userWorkspace.id,
      workspaceId: runInfo.workspaceId,
    });

    return { userWorkspaceId: userWorkspace.id, roleId };
  }

  private async getWorkflow(
    workflowId: string,
    workspaceId: string,
  ): Promise<WorkflowWorkspaceEntity> {
    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflow = await workflowRepository.findOne({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return workflow;
  }
}
