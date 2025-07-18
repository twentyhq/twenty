import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  ToolRegistryService,
  ToolType,
} from 'src/engine/core-modules/tool/tool-registry.service';
import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';

import { isWorkflowHttpRequestAction } from './guards/is-workflow-http-request-action.guard';
import { WorkflowHttpRequestActionInput } from './types/workflow-http-request-action-input.type';

@Injectable()
export class HttpRequestWorkflowActionAdapter implements WorkflowAction {
  constructor(private readonly toolRegistryService: ToolRegistryService) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new Error('Step not found');
    }
    if (!isWorkflowHttpRequestAction(step)) {
      throw new Error('Step is not an HTTP Request action');
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowHttpRequestActionInput;

    const tool = this.toolRegistryService.getTool(ToolType.HTTP_REQUEST);

    if (!tool) {
      throw new Error('HTTP tool not found in registry');
    }

    const toolInput: ToolInput = {
      parameters: workflowActionInput,
      context: {
        workspaceId: context.workspaceId as string,
        userId: context.userId as string,
        roleId: context.roleId as string,
      },
    };

    const toolOutput = await tool.execute(toolInput);

    return {
      result: toolOutput.result as object,
      error: toolOutput.error,
    };
  }
}
