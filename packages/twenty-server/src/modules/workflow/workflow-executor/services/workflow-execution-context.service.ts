import { Injectable } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { type WorkflowRunWorkspaceService as WorkflowRunService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
 
export class WorkflowExecutionContextService {
  constructor(
    private readonly workflowRunService: WorkflowRunService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly userRoleService: UserRoleService,
  ) {}

  async getExecutionContext(runInfo: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<WorkflowExecutionContext> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    const isActingOnBehalfOfUser =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    let roleId: string | undefined;

    if (isActingOnBehalfOfUser) {
      const workspaceMember =
        await this.userWorkspaceService.getWorkspaceMemberOrThrow({
          workspaceMemberId: workflowRun.createdBy.workspaceMemberId!,
          workspaceId: runInfo.workspaceId,
        });

      const userWorkspace =
        await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
          userId: workspaceMember.userId,
          workspaceId: runInfo.workspaceId,
        });

      roleId = await this.userRoleService.getRoleIdForUserWorkspace({
        userWorkspaceId: userWorkspace.id,
        workspaceId: runInfo.workspaceId,
      });
    }

    const rolePermissionConfig = roleId
      ? { unionOf: [roleId] }
      : { shouldBypassPermissionChecks: true as const };

    return {
      isActingOnBehalfOfUser,
      initiator: workflowRun.createdBy,
      rolePermissionConfig,
    };
  }
}
