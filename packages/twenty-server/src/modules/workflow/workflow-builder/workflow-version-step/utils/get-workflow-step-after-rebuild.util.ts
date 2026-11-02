import omit from 'lodash.omit';
import {
  isWorkflowAiAgentGenerateStep,
  WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
  workflowAiAgentConversationConfigSchema,
  workflowAiAgentInlineConfigSchema,
  WorkflowActionType,
} from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowAiAgentAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowAiAgentStepInput = WorkflowAiAgentAction['settings']['input'];

// a Generate step runs once as the caller, so it has no conversation; an agent step takes its config from the agent
const getStepInputAfterRebuild = ({
  existingInput,
  updatedInput,
  builtInput,
}: {
  existingInput: WorkflowAiAgentStepInput;
  updatedInput: WorkflowAiAgentStepInput;
  builtInput: WorkflowAiAgentStepInput;
}): WorkflowAiAgentStepInput => {
  const keysOutsideBuiltStepKind = isWorkflowAiAgentGenerateStep(builtInput)
    ? [
        'workspaceMemberId',
        ...workflowAiAgentConversationConfigSchema.keyof().options,
      ]
    : workflowAiAgentInlineConfigSchema.keyof().options;

  return {
    ...builtInput,
    ...omit({ ...existingInput, ...updatedInput }, [
      'agentId',
      ...keysOutsideBuiltStepKind,
    ]),
  };
};

export const getWorkflowStepAfterRebuild = ({
  existingStep,
  updatedStep,
  builtStep,
  previousAgentLabel,
}: {
  existingStep: WorkflowAction;
  updatedStep: WorkflowAction;
  builtStep: WorkflowAction;
  previousAgentLabel: string | undefined;
}): WorkflowAction => {
  if (
    existingStep.type !== WorkflowActionType.AI_AGENT ||
    updatedStep.type !== WorkflowActionType.AI_AGENT ||
    builtStep.type !== WorkflowActionType.AI_AGENT
  ) {
    return builtStep;
  }

  const aiAgentStepDefaultNames = [
    WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
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
        updatedInput: updatedStep.settings.input,
        builtInput: builtStep.settings.input,
      }),
      errorHandlingOptions: existingStep.settings.errorHandlingOptions,
    },
  };
};
