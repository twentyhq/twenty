import { type ConnectedAccountOperation } from 'twenty-shared/types';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import {
  isDefined,
  resolveInput as resolveWorkflowInput,
} from 'twenty-shared/utils';

import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import { buildEmailStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { resolveEmailBody } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-body.util';
import { resolveEmailFiles } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-files.util';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

export abstract class EmailWorkflowActionBase extends ToolBackedWorkflowAction<WorkflowSendEmailActionInput> {
  protected constructor(
    loggerName: string,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
  ) {
    super(loggerName, workflowRunStepLogService);
  }

  protected abstract getMode(): ConnectedAccountOperation;

  protected override async preprocessInput(
    rawInput: WorkflowSendEmailActionInput,
    context: Record<string, unknown>,
  ): Promise<WorkflowSendEmailActionInput> {
    const files = resolveEmailFiles(rawInput.files, context);

    const body = isDefined(rawInput.body)
      ? await resolveEmailBody(rawInput.body, context)
      : rawInput.body;

    return { ...rawInput, body, files };
  }

  protected override resolveInput(
    input: WorkflowSendEmailActionInput,
    context: Record<string, unknown>,
  ): WorkflowSendEmailActionInput {
    const { body, ...inputWithoutBody } = input;

    return {
      ...(resolveWorkflowInput(
        inputWithoutBody,
        context,
      ) as typeof inputWithoutBody),
      body,
    };
  }

  protected override async buildToolExecutionContext(
    runInfo: WorkflowRunInfo,
  ): Promise<ToolExecutionContext> {
    const { authContext } =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    return { workspaceId: runInfo.workspaceId, authContext };
  }

  protected buildStepLog({
    input,
    output,
    durationMs,
  }: {
    input: WorkflowSendEmailActionInput;
    output: ToolOutput;
    durationMs: number;
  }): WorkflowRunStepLog {
    return buildEmailStepLog({
      mode: this.getMode(),
      input,
      output,
      durationMs,
    });
  }
}
