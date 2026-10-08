import { type WorkflowConversation } from 'twenty-shared/workflow';

export type WorkflowAiAgentActionInput = {
  agentId?: string;
  prompt?: string;
  humanInputInstructions?: string;
  workspaceMemberId?: string;
  conversation?: WorkflowConversation;
};
