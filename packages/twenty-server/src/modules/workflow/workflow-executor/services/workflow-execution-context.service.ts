import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
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
  ) {}

  async getExecutionContext(runInfo: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<WorkflowExecutionContext> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    this.logger.log(
      `Getting execution context for workflow run ${runInfo.workflowRunId}. CreatedBy source: ${workflowRun.createdBy?.source}, workspaceMemberId: ${workflowRun.createdBy?.workspaceMemberId}`,
    );

    // Check if createdBy composite field is properly loaded
    if (!workflowRun.createdBy) {
      this.logger.error(
        `WorkflowRun ${runInfo.workflowRunId} has no createdBy field - this indicates a data issue`,
      );
      throw new Error(
        'WorkflowRun createdBy field is missing - cannot determine execution context',
      );
    }

    const isActingOnBehalfOfUser =
      workflowRun.createdBy.source === FieldActorSource.MANUAL &&
      isDefined(workflowRun.createdBy.workspaceMemberId);

    let roleId: string | undefined;
    let userWorkspaceId: string | undefined;

    // Get userWorkspaceId for Common API auth context validation
    // Priority 1: Use the workflow run's initiator/creator if available (manual triggers)
    // Priority 2: Fall back to the workflow creator for automated triggers
    if (
      isActingOnBehalfOfUser ||
      isDefined(workflowRun.createdBy.workspaceMemberId)
    ) {
      try {
        this.logger.log(
          `Attempting to get userWorkspaceId from workspaceMemberId: ${workflowRun.createdBy.workspaceMemberId}`,
        );

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

        userWorkspaceId = userWorkspace.id;

        if (isActingOnBehalfOfUser) {
          roleId = await this.userRoleService.getRoleIdForUserWorkspace({
            userWorkspaceId: userWorkspace.id,
            workspaceId: runInfo.workspaceId,
          });
        }

        this.logger.log(
          `Successfully found userWorkspaceId from workflow run creator: ${userWorkspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to get workspace member from workflow run createdBy (workspaceMemberId: ${workflowRun.createdBy.workspaceMemberId}): ${error.message}`,
        );
        throw new Error(
          `Failed to resolve userWorkspaceId for workflow run ${runInfo.workflowRunId}: ${error.message}`,
        );
      }
    } else {
      this.logger.log(
        `WorkflowRun has no workspaceMemberId (source: ${workflowRun.createdBy.source}). Cannot determine user context.`,
      );
    }

    // userWorkspaceId is required for auth context validation
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
}
