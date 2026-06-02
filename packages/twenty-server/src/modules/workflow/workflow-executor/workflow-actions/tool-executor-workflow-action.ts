import { Injectable, Logger } from '@nestjs/common';
import type { JSONContent } from '@tiptap/core';

import {
  isDefined,
  parseJson,
  resolveInput,
  resolveRichTextVariables,
} from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { renderRichTextToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowHttpRequestActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-input.type';
import { buildHttpRequestStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/utils/build-http-request-step-log.util';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import {
  buildEmailStepLog,
  type EmailStepLogMode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

@Injectable()
export class ToolExecutorWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(ToolExecutorWorkflowAction.name);
  private readonly toolsByActionType: Map<WorkflowActionType, Tool>;

  constructor(
    private readonly httpTool: HttpTool,
    private readonly sendEmailTool: SendEmailTool,
    private readonly draftEmailTool: DraftEmailTool,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
  ) {
    this.toolsByActionType = new Map<WorkflowActionType, Tool>([
      [WorkflowActionType.HTTP_REQUEST, this.httpTool],
      [WorkflowActionType.SEND_EMAIL, this.sendEmailTool],
      [WorkflowActionType.DRAFT_EMAIL, this.draftEmailTool],
    ]);
  }

  private async resolveEmailBody(
    body: string,
    context: Record<string, unknown>,
  ): Promise<string> {
    const bodyWithResolvedVariables = resolveRichTextVariables(body, context);
    const tipTapDocument = isDefined(bodyWithResolvedVariables)
      ? parseJson<JSONContent>(bodyWithResolvedVariables)
      : null;

    if (isDefined(tipTapDocument) && tipTapDocument.type === 'doc') {
      return renderRichTextToHtml(tipTapDocument);
    }

    return bodyWithResolvedVariables ?? body;
  }

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }

    const tool = this.toolsByActionType.get(step.type);

    if (!tool) {
      throw new WorkflowStepExecutorException(
        `No tool found for workflow action type: ${step.type}`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    let toolInput = step.settings.input;

    if (
      step.type === WorkflowActionType.SEND_EMAIL ||
      step.type === WorkflowActionType.DRAFT_EMAIL
    ) {
      const emailInput = toolInput as WorkflowSendEmailActionInput;

      if (isDefined(emailInput.body)) {
        const emailBody = await this.resolveEmailBody(emailInput.body, context);
        toolInput = {
          ...emailInput,
          body: emailBody,
        };
      }
    }

    toolInput = resolveInput(toolInput, context) as ToolInput;

    const startedAt = Date.now();

    const toolOutput = await tool.execute(toolInput, {
      workspaceId: runInfo.workspaceId,
    });

    const durationMs = Date.now() - startedAt;

    if (step.type === WorkflowActionType.HTTP_REQUEST) {
      await this.persistHttpRequestStepLog({
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
        stepId: currentStepId,
        input: toolInput as WorkflowHttpRequestActionInput,
        output: toolOutput,
        durationMs,
      });
    } else if (
      step.type === WorkflowActionType.SEND_EMAIL ||
      step.type === WorkflowActionType.DRAFT_EMAIL
    ) {
      await this.persistEmailStepLog({
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
        stepId: currentStepId,
        mode: step.type === WorkflowActionType.SEND_EMAIL ? 'SEND' : 'DRAFT',
        input: toolInput as WorkflowSendEmailActionInput,
        output: toolOutput,
        durationMs,
      });
    }

    return {
      result: toolOutput.result as object,
      error: toolOutput.error,
    };
  }

  private async persistHttpRequestStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    input,
    output,
    durationMs,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    input: WorkflowHttpRequestActionInput;
    output: ToolOutput;
    durationMs: number;
  }): Promise<void> {
    try {
      await this.workflowRunStepLogService.setStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        stepLog: buildHttpRequestStepLog({ input, output, durationMs }),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist HTTP step log for workflowRun=${workflowRunId} step=${stepId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async persistEmailStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    mode,
    input,
    output,
    durationMs,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    mode: EmailStepLogMode;
    input: WorkflowSendEmailActionInput;
    output: ToolOutput;
    durationMs: number;
  }): Promise<void> {
    try {
      await this.workflowRunStepLogService.setStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        stepLog: buildEmailStepLog({ mode, input, output, durationMs }),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist email step log for workflowRun=${workflowRunId} step=${stepId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
