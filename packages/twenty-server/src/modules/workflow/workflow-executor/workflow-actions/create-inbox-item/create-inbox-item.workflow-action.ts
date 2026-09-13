import { Injectable } from '@nestjs/common';

import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { CreateInboxItemTool } from 'src/engine/core-modules/tool/tools/inbox-tool/create-inbox-item-tool';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { isWorkflowCreateInboxItemAction } from 'src/modules/workflow/workflow-executor/workflow-actions/create-inbox-item/guards/is-workflow-create-inbox-item-action.guard';
import { type WorkflowCreateInboxItemActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/create-inbox-item/types/workflow-create-inbox-item-action-input.type';
import { buildCreateInboxItemStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/create-inbox-item/utils/build-create-inbox-item-step-log.util';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

// Conditional routing lives here rather than in a rule builder: a workflow
// already knows how to branch, so "escalate only when the amount is over 10k"
// is an If/Else above this step instead of a second rules engine in settings.
@Injectable()
export class CreateInboxItemWorkflowAction extends ToolBackedWorkflowAction<WorkflowCreateInboxItemActionInput> {
  constructor(
    private readonly createInboxItemTool: CreateInboxItemTool,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
  ) {
    super(CreateInboxItemWorkflowAction.name, workflowRunStepLogService);
  }

  protected getTool(): Tool {
    return this.createInboxItemTool;
  }

  protected assertStep(step: WorkflowAction): void {
    if (!isWorkflowCreateInboxItemAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a create-inbox-item action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }
  }

  protected buildStepLog({
    input,
    output,
    durationMs,
  }: {
    input: WorkflowCreateInboxItemActionInput;
    output: ToolOutput;
    durationMs: number;
  }): WorkflowRunStepLog {
    return buildCreateInboxItemStepLog({ input, output, durationMs });
  }
}
