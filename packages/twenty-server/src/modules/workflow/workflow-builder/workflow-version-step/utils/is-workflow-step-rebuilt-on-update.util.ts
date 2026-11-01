import {
  isWorkflowAiAgentGenerateStep,
  WorkflowActionType,
} from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const getAiAgentStepAgentId = (step: WorkflowAction): string | undefined =>
  step.type === WorkflowActionType.AI_AGENT &&
  !isWorkflowAiAgentGenerateStep(step.settings.input)
    ? step.settings.input.agentId
    : undefined;

// an AI step's agent decides its kind and what the step owns, so changing it rebuilds the step like a type change
export const isWorkflowStepRebuiltOnUpdate = ({
  existingStep,
  updatedStep,
}: {
  existingStep: WorkflowAction;
  updatedStep: WorkflowAction;
}): boolean =>
  existingStep.type !== updatedStep.type ||
  getAiAgentStepAgentId(existingStep) !== getAiAgentStepAgentId(updatedStep);
