import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { isDefined } from 'twenty-shared/utils';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import {
  buildEmailStepLog,
  type EmailStepLogMode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { resolveEmailBody } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-body.util';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';

export abstract class EmailWorkflowActionBase extends ToolBackedWorkflowAction<WorkflowSendEmailActionInput> {
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
