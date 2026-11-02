export const WORKFLOW_AI_AGENT_STEP_CONFIG_ISSUE_MESSAGES = {
  AGENT_STEP_HAS_INLINE_CONFIG:
    'A step running an agent takes its instructions, model and permissions from the agent. Remove the instructions, model and permissions set on the step, or remove its agent.',
  GENERATE_STEP_HAS_CONVERSATION_CONFIG:
    'A step without an agent cannot ask humans or keep a conversation. Use an agent for this step, or remove its human input instructions and conversation setting.',
  GENERATE_STEP_SCOPE_HAS_REPEATED_ENTRIES:
    'The permissions of a step without an agent list an object or field more than once. Keep a single entry for each.',
} as const;

export type WorkflowAiAgentStepConfigIssueCode =
  keyof typeof WORKFLOW_AI_AGENT_STEP_CONFIG_ISSUE_MESSAGES;
