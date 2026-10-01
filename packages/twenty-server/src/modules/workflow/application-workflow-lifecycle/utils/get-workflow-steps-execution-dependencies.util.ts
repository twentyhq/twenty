import { isNonEmptyString } from '@sniptt/guards';

import { type WorkflowExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-execution-dependencies.type';
import { isWorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/guards/is-workflow-ai-agent-action.guard';
import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { isWorkflowLogicFunctionAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/guards/is-workflow-logic-function-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getWorkflowStepsExecutionDependencies = (
  steps: WorkflowAction[],
): WorkflowExecutionDependencies => {
  const logicFunctionIds = new Set<string>();
  const agentIds = new Set<string>();

  for (const step of steps) {
    if (
      (isWorkflowCodeAction(step) || isWorkflowLogicFunctionAction(step)) &&
      isNonEmptyString(step.settings.input.logicFunctionId)
    ) {
      logicFunctionIds.add(step.settings.input.logicFunctionId);
    }

    if (
      isWorkflowAiAgentAction(step) &&
      isNonEmptyString(step.settings.input.agentId)
    ) {
      agentIds.add(step.settings.input.agentId);
    }
  }

  return {
    logicFunctionIds: [...logicFunctionIds],
    agentIds: [...agentIds],
  };
};
