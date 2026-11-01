import { isDefined } from 'twenty-shared/utils';
import {
  isWorkflowAiAgentGenerateStep,
  WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
  WORKFLOW_AI_AGENT_STEP_OWNED_AGENT_STEP_DEFAULT_NAME,
  WorkflowActionType,
} from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowAiAgentAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowAiAgentStepInput = WorkflowAiAgentAction['settings']['input'];

// a Generate step runs once as the caller, so the conversation settings only carry over to a step that runs an agent
const getStepInputAfterRebuild = ({
  existingInput,
  builtInput,
}: {
  existingInput: WorkflowAiAgentStepInput;
  builtInput: WorkflowAiAgentStepInput;
}): WorkflowAiAgentStepInput => {
  const {
    prompt,
    responseFormat,
    workspaceMemberId,
    humanInputInstructions,
    conversation,
  } = existingInput;
  const isBuiltIntoAgentStep = !isWorkflowAiAgentGenerateStep(builtInput);

  return {
    ...builtInput,
    ...(isDefined(prompt) ? { prompt } : {}),
    ...(isDefined(responseFormat) ? { responseFormat } : {}),
    ...(isBuiltIntoAgentStep && isDefined(workspaceMemberId)
      ? { workspaceMemberId }
      : {}),
    ...(isBuiltIntoAgentStep && isDefined(humanInputInstructions)
      ? { humanInputInstructions }
      : {}),
    ...(isBuiltIntoAgentStep && isDefined(conversation)
      ? { conversation }
      : {}),
  };
};

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
    WORKFLOW_AI_AGENT_STEP_OWNED_AGENT_STEP_DEFAULT_NAME,
    previousAgentLabel,
  ];

  return {
    ...builtStep,
    name: aiAgentStepDefaultNames.includes(existingStep.name)
      ? builtStep.name
      : existingStep.name,
    settings: {
      ...builtStep.settings,
      input: getStepInputAfterRebuild({
        existingInput: existingStep.settings.input,
        builtInput: builtStep.settings.input,
      }),
      errorHandlingOptions: existingStep.settings.errorHandlingOptions,
    },
  };
};
