export const WORKFLOW_AI_AGENT_STEP_CONFIG_ISSUE_MESSAGES = {
  AGENT_STEP_HAS_INLINE_CONFIG:
    'A step running an agent takes its instructions, model and permissions from the agent.',
  GENERATE_STEP_HAS_CONVERSATION_CONFIG:
    'A step without an agent cannot ask humans or keep a conversation. Use an agent for this step, or remove its human input instructions and conversation setting.',
} as const;

export type WorkflowAiAgentStepConfigIssueCode =
  keyof typeof WORKFLOW_AI_AGENT_STEP_CONFIG_ISSUE_MESSAGES;
