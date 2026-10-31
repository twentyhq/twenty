import {
  WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
  WorkflowActionType,
} from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// the name AI steps were created with when each ran a hidden agent
const STEP_OWNED_AGENT_STEP_DEFAULT_NAME = 'Agent';

export const getWorkflowStepNameAfterRebuild = ({
  existingStep,
  builtStep,
  previousAgentLabel,
}: {
  existingStep: Pick<WorkflowAction, 'type' | 'name'>;
  builtStep: Pick<WorkflowAction, 'name'>;
  previousAgentLabel: string | undefined;
}): string => {
  if (existingStep.type !== WorkflowActionType.AI_AGENT) {
    return builtStep.name;
  }

  const aiAgentStepDefaultNames = [
    WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
    STEP_OWNED_AGENT_STEP_DEFAULT_NAME,
    previousAgentLabel,
  ];

  return aiAgentStepDefaultNames.includes(existingStep.name)
    ? builtStep.name
    : existingStep.name;
};
