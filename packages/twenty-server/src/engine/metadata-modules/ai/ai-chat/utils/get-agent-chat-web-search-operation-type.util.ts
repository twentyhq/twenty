import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentChatOperationType } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-plan.type';

// Native web search inside an included turn is part of the included chat, so it must not reach the allowance
export const getAgentChatWebSearchOperationType = (
  operationType: AgentChatOperationType,
): UsageOperationType.WEB_SEARCH | UsageOperationType.AI_CHAT_INCLUDED =>
  operationType === UsageOperationType.AI_CHAT_INCLUDED
    ? UsageOperationType.AI_CHAT_INCLUDED
    : UsageOperationType.WEB_SEARCH;
