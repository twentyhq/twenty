import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type WorkflowActionType } from 'twenty-shared/workflow';

import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { APPLICATION_WORKFLOW_STEP_PERMISSION_FLAGS } from 'src/modules/workflow/workflow-executor/constants/application-workflow-step-permission-flags.constant';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

@Injectable()
export class ApplicationWorkflowStepPermissionService {
  constructor(private readonly permissionsService: PermissionsService) {}

  async assertRunApplicationMayUseStepOrThrow({
    workspaceId,
    runApplicationId,
    stepType,
  }: {
    workspaceId: string;
    runApplicationId: string;
    stepType: WorkflowActionType;
  }): Promise<void> {
    const permissionFlag = APPLICATION_WORKFLOW_STEP_PERMISSION_FLAGS[stepType];

    if (!isDefined(permissionFlag)) {
      return;
    }

    const applicationHasPermissionFlag =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: undefined,
        workspaceId,
        setting: permissionFlag,
        applicationId: runApplicationId,
        agentId: undefined,
      });

    if (applicationHasPermissionFlag) {
      return;
    }

    throw new WorkflowStepExecutorException(
      `This application needs the ${permissionFlag} permission to run ${stepType} steps`,
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }
}
