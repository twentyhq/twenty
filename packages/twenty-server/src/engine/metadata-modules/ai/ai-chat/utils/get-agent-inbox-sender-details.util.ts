import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';

type AgentInboxSenderDetails = {
  key: string;
  applicationId: string | null;
  description: string;
};

export const getAgentInboxSenderDetails = (
  sender: AgentInboxSender,
): AgentInboxSenderDetails =>
  sender.type === 'application'
    ? {
        key: sender.application.id,
        applicationId: sender.application.id,
        description: `The "${sender.application.name}" application`,
      }
    : {
        key: `workflow:${sender.workflowId}`,
        applicationId: null,
        description: `The "${sender.workflowName}" workflow`,
      };
