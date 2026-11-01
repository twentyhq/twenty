import {
  WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
  WorkflowActionType,
} from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// the name AI steps were created with when each ran a hidden agent
const STEP_OWNED_AGENT_STEP_DEFAULT_NAME = 'Agent';

// switching an AI step between Generate and agents keeps what the author set on the step itself
export const getWorkflowStepAfterRebuild = ({
  existingStep,
  builtStep,
  previousAgentLabel,
}: {
  existingStep: WorkflowAction;
  builtStep: WorkflowAction;
  previousAgentLabel: string | undefined;
}): WorkflowAction => {
  if (
    existingStep.type !== WorkflowActionType.AI_AGENT ||
    builtStep.type !== WorkflowActionType.AI_AGENT
  ) {
    return builtStep;
  }

  const aiAgentStepDefaultNames = [
    WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
    STEP_OWNED_AGENT_STEP_DEFAULT_NAME,
    previousAgentLabel,
  ];

  return {
    ...builtStep,
    name: aiAgentStepDefaultNames.includes(existingStep.name)
      ? builtStep.name
      : existingStep.name,
    settings: {
      ...builtStep.settings,
      errorHandlingOptions: existingStep.settings.errorHandlingOptions,
    },
  };
};
