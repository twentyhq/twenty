import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkflowStepExecutorException } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowRunApplicationsService } from 'src/modules/workflow/workflow-executor/services/workflow-run-applications.service';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { canMemberChangeWorkflowRun } from 'src/modules/workflow/workflow-runner/utils/can-member-change-workflow-run.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class WorkflowRunChangeAuthorizationWorkspaceService {
  constructor(
    private readonly workflowRunService: WorkflowRunWorkspaceService,
    private readonly workflowRunApplicationsService: WorkflowRunApplicationsService,
  ) {}

  async assertMemberCanChangeRunOrThrow({
    runInfo,
    workspaceMemberId,
    replacementStep,
  }: {
    runInfo: WorkflowRunInfo;
    workspaceMemberId: string | undefined;
    replacementStep?: WorkflowAction;
  }): Promise<void> {
    const workflowRun = await this.workflowRunService.getWorkflowRunOrFail({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    const { boundingApplications } = await this.workflowRunApplicationsService
      .findWorkflowRunApplications(workflowRun, runInfo.workspaceId)
      .catch((error: unknown) => {
        if (error instanceof WorkflowStepExecutorException) {
          throw new PermissionsException(
            error.message,
            PermissionsExceptionCode.PERMISSION_DENIED,
          );
        }

        throw error;
      });

    if (
      !canMemberChangeWorkflowRun({
        workflowRun,
        boundingApplication: boundingApplications[0] ?? null,
        workspaceMemberId,
        replacementStep,
      })
    ) {
      throw new PermissionsException(
        'Only the member who started this application-bound workflow run can change it',
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`Only the member who started this run can change it.`,
        },
      );
    }
  }
}
