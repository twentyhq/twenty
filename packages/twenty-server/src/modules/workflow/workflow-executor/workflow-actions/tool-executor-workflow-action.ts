import { Injectable } from '@nestjs/common';

import { resolveInput, resolveRichTextVariables } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class ToolExecutorWorkflowAction implements WorkflowAction {
  private readonly toolsByActionType: Map<WorkflowActionType, Tool>;

  constructor(
    private readonly httpTool: HttpTool,
    private readonly sendEmailTool: SendEmailTool,
  ) {
    this.toolsByActionType = new Map<WorkflowActionType, Tool>([
      [WorkflowActionType.HTTP_REQUEST, this.httpTool],
      [WorkflowActionType.SEND_EMAIL, this.sendEmailTool],
    ]);
  }

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new Error('Step not found');
    }

    const tool = this.toolsByActionType.get(step.type);

    if (!tool) {
      throw new Error(`No tool found for workflow action type: ${step.type}`);
    }

    let toolInput = step.settings.input;

    if (step.type === WorkflowActionType.SEND_EMAIL) {
      const sendEmailInput = toolInput as WorkflowSendEmailActionInput;

      if (sendEmailInput.body) {
        toolInput = {
          ...sendEmailInput,
          body: resolveRichTextVariables(sendEmailInput.body, context),
        };
      }
    }

    toolInput = resolveInput(toolInput, context) as ToolInput;

    const toolOutput = await tool.execute(toolInput, {
      workspaceId: runInfo.workspaceId,
    });

    return {
      result: toolOutput.result as object,
      error: toolOutput.error,
    };
  }
}
