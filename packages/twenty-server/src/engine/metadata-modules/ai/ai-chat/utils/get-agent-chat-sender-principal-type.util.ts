import { isDefined } from 'twenty-shared/utils';

import { type AgentChatPrincipalType } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-principal-type.type';
import { type AgentChatSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-sender.type';

export const getAgentChatSenderPrincipalType = (
  sender: AgentChatSender,
): AgentChatPrincipalType =>
  isDefined(sender.applicationId) ? 'application' : 'userSession';
