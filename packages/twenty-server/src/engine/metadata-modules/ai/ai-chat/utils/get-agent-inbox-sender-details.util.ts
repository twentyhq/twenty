import { INBOX_SENDER_NAME_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-sender-name-max-length.constant';
import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';
import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

type AgentInboxSenderDetails = {
  key: string;
  applicationId: string | null;
  description: string;
};

// The description opens the conversation as a system message, so a name can
// neither start a line of its own nor close its quotes
const quoteSenderName = (name: string): string =>
  JSON.stringify(
    sanitizePromptContextLine({
      value: name,
      maxLength: INBOX_SENDER_NAME_MAX_LENGTH,
    }) ?? '',
  );

export const getAgentInboxSenderDetails = (
  sender: AgentInboxSender,
): AgentInboxSenderDetails =>
  sender.type === 'application'
    ? {
        key: `application:${sender.application.id}`,
        applicationId: sender.application.id,
        description: `The ${quoteSenderName(sender.application.name)} application`,
      }
    : {
        key: `workflow:${sender.workflowId}`,
        applicationId: null,
        description: `The ${quoteSenderName(sender.workflowName)} workflow`,
      };
