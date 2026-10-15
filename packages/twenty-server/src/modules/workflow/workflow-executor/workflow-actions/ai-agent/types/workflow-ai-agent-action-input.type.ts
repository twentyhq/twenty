import { type AgentResponseFormat } from 'twenty-shared/ai';
import { type WorkflowConversation } from 'twenty-shared/workflow';

export type WorkflowAiAgentActionInput = {
  agentId: string;
  prompt?: string;
  responseFormat?: AgentResponseFormat;
  humanInputInstructions?: string;
  workspaceMemberId?: string;
  conversation?: WorkflowConversation;
};
