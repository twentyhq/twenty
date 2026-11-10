import { type AgentMessageRow } from '@/ai/types/AgentMessageRow';
import { type ExtendedUIMessage } from '@/ai/types/ExtendedUIMessage';
import { mapAgentMessagePartToUIMessagePart } from '@/ai/utils/map-agent-message-part-to-ui-message-part.util';
import { isDefined } from '@/utils/validation/isDefined';

export const mapAgentMessagesToUIMessages = (
  messages: AgentMessageRow[],
): ExtendedUIMessage[] =>
  messages.map((message) => ({
    id: message.id,
    role: message.role as ExtendedUIMessage['role'],
    status: message.status as 'queued' | 'sent',
    parts: [...message.parts]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(mapAgentMessagePartToUIMessagePart)
      .filter(isDefined),
    metadata: {
      createdAt: message.createdAt,
      senderWorkspaceMemberId: message.senderWorkspaceMemberId,
      senderApplicationId: message.senderApplicationId,
      agentId: message.agentId,
      isBuiltInAssistant: message.isBuiltInAssistant,
      turnId: message.turnId,
      ...(message.role === 'assistant'
        ? {
            startedAt: message.createdAt,
            // the assistant message is rewritten until its stream finishes
            finishedAt: message.processedAt ?? undefined,
          }
        : {}),
    },
    threadId: message.threadId,
  }));
