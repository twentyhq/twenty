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

export const isWorkflowAiAgentStepKindChanged = ({
  existingStep,
  updatedStep,
}: {
  existingStep: WorkflowAction;
  updatedStep: WorkflowAction;
}): boolean =>
  existingStep.type === updatedStep.type &&
  getAiAgentStepAgentId(existingStep) !== getAiAgentStepAgentId(updatedStep);
