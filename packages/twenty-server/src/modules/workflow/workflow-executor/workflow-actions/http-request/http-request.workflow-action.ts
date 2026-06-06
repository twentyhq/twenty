import { Injectable } from '@nestjs/common';

import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { isWorkflowHttpRequestAction } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/guards/is-workflow-http-request-action.guard';
import { type WorkflowHttpRequestActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-input.type';
import { buildHttpRequestStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/utils/build-http-request-step-log.util';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

@Injectable()
export class HttpRequestWorkflowAction extends ToolBackedWorkflowAction<WorkflowHttpRequestActionInput> {
  constructor(
    private readonly httpTool: HttpTool,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    workflowExecutionContextService: WorkflowExecutionContextService,
  ) {
    super(
      HttpRequestWorkflowAction.name,
      workflowRunStepLogService,
      workflowExecutionContextService,
    );
  }

  protected getTool(): Tool {
    return this.httpTool;
  }

  protected assertStep(step: WorkflowAction): void {
    if (!isWorkflowHttpRequestAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an HTTP request action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }
  }

  protected buildStepLog({
    input,
    output,
    durationMs,
  }: {
    input: WorkflowHttpRequestActionInput;
    output: ToolOutput;
    durationMs: number;
  }): WorkflowRunStepLog {
    return buildHttpRequestStepLog({ input, output, durationMs });
  }
}
