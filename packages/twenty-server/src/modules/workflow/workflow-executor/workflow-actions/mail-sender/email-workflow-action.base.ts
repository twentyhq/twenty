import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { isDefined } from 'twenty-shared/utils';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkflowEmailSenderService } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/services/workflow-email-sender.service';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import {
  buildEmailStepLog,
  type EmailStepLogMode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { resolveEmailBody } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-body.util';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

export abstract class EmailWorkflowActionBase extends ToolBackedWorkflowAction<WorkflowSendEmailActionInput> {
  protected constructor(
    loggerName: string,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workflowEmailSenderService: WorkflowEmailSenderService,
  ) {
    super(loggerName, workflowRunStepLogService);
  }

  protected abstract getMode(): EmailStepLogMode;

  protected override async preprocessInput(
    rawInput: WorkflowSendEmailActionInput,
    context: Record<string, unknown>,
  ): Promise<WorkflowSendEmailActionInput> {
    if (!isDefined(rawInput.body)) {
      return rawInput;
    }

    const renderedBody = await resolveEmailBody(rawInput.body, context);

    return { ...rawInput, body: renderedBody };
  }

  protected override async postprocessInput(
    resolvedInput: WorkflowSendEmailActionInput,
    workspaceId: string,
  ): Promise<WorkflowSendEmailActionInput> {
    if (!isDefined(resolvedInput.connectedAccountId)) {
      return resolvedInput;
    }

    const connectedAccountId =
      await this.workflowEmailSenderService.resolveSenderConnectedAccountId(
        resolvedInput.connectedAccountId,
        workspaceId,
      );

    return { ...resolvedInput, connectedAccountId };
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
