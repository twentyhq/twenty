import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentChatOperationType } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-plan.type';

// The allowance never counts included chat, and members cannot set limits on it, so each plan stops on its own bound
export const getAgentChatStepStopReason = ({
  operationType,
  exhaustedKind,
}: {
  operationType: AgentChatOperationType;
  exhaustedKind: ExhaustedKind | null;
}): 'creditsExhausted' | 'includedChatPaused' | null => {
  if (operationType === UsageOperationType.AI_CHAT_INCLUDED) {
    return exhaustedKind === 'limit' ? 'includedChatPaused' : null;
  }

  return exhaustedKind === 'allowance' ? 'creditsExhausted' : null;
};
