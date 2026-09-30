import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { CreateCalendarEventTool } from 'src/engine/core-modules/tool/tools/calendar-tool/create-calendar-event-tool';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { getUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-user-from-auth-context.util';
import { isWorkflowCreateCalendarEventAction } from 'src/modules/workflow/workflow-executor/workflow-actions/create-calendar-event/guards/is-workflow-create-calendar-event-action.guard';
import { type WorkflowCreateCalendarEventActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/create-calendar-event/types/workflow-create-calendar-event-action-input.type';
import { buildCreateCalendarEventStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/create-calendar-event/utils/build-create-calendar-event-step-log.util';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

@Injectable()
export class CreateCalendarEventWorkflowAction extends ToolBackedWorkflowAction<WorkflowCreateCalendarEventActionInput> {
  constructor(
    private readonly createCalendarEventTool: CreateCalendarEventTool,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly permissionsService: PermissionsService,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
  ) {
    super(CreateCalendarEventWorkflowAction.name, workflowRunStepLogService);
  }

  protected getTool(): Tool {
    return this.createCalendarEventTool;
  }

  protected assertStep(step: WorkflowAction): void {
    if (!isWorkflowCreateCalendarEventAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a create-calendar-event action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }
  }

  protected override async buildToolExecutionContext(
    runInfo: WorkflowRunInfo,
  ): Promise<ToolExecutionContext> {
    const { authContext, rolePermissionConfig, application } =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    if (!isDefined(application)) {
      return { workspaceId: runInfo.workspaceId };
    }

    const permissionFlag = this.createCalendarEventTool.flag;

    const hasToolPermission = await this.permissionsService.hasToolPermission(
      rolePermissionConfig,
      runInfo.workspaceId,
      permissionFlag,
    );

    if (!hasToolPermission) {
      throw new WorkflowStepExecutorException(
        `Application "${application.name}" is missing the ${permissionFlag} permission required by this step`,
        WorkflowStepExecutorExceptionCode.FORBIDDEN,
      );
    }

    return {
      workspaceId: runInfo.workspaceId,
      ...getUserFromAuthContext(authContext),
      requireConnectedAccountUsableByCaller: true,
    };
  }

  protected buildStepLog({
    input,
    output,
    durationMs,
  }: {
    input: WorkflowCreateCalendarEventActionInput;
    output: ToolOutput;
    durationMs: number;
  }): WorkflowRunStepLog {
    return buildCreateCalendarEventStepLog({ input, output, durationMs });
  }
}
