import { type AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';

export type AgentConversationMessageText = {
  role: AgentMessageRole.USER | AgentMessageRole.ASSISTANT;
  text: string;
};
