import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

export const AGENT_HISTORY_OBJECT_UNIVERSAL_IDENTIFIERS = {
  agentChatThread: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  agentTurn: STANDARD_OBJECTS.agentTurn.universalIdentifier,
  agentMessage: STANDARD_OBJECTS.agentMessage.universalIdentifier,
  agentMessagePart: STANDARD_OBJECTS.agentMessagePart.universalIdentifier,
} as const satisfies Record<AgentHistoryObjectName, string>;
