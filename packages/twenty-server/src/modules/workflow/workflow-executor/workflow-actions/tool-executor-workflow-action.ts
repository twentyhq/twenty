import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class ToolExecutorWorkflowAction implements WorkflowAction {
  constructor(private readonly toolRegistry: ToolRegistryService) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new Error('Step not found');
    }

    const toolType = this.mapWorkflowActionTypeToToolType(step.type);

    if (!toolType) {
      throw new Error(
        `No tool mapping found for workflow action type: ${step.type}`,
      );
    }

    const tool = this.toolRegistry.getTool(toolType);

    if (!tool) {
      throw new Error(
        `Tool for action type ${step.type} not found in registry`,
      );
    }

    const toolInput = resolveInput(step.settings.input, context) as ToolInput;

    const toolOutput = await tool.execute(toolInput);

    return {
      result: toolOutput.result as object,
      error: toolOutput.error,
    };
  }

  private mapWorkflowActionTypeToToolType(
    actionType: WorkflowActionType,
  ): ToolType | null {
    const mapping: Partial<Record<WorkflowActionType, ToolType>> = {
      [WorkflowActionType.HTTP_REQUEST]: ToolType.HTTP_REQUEST,
      [WorkflowActionType.SEND_EMAIL]: ToolType.SEND_EMAIL,
    };

    return mapping[actionType] || null;
  }
}
