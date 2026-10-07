import { type BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { buildUsageRefusalException } from 'src/engine/core-modules/billing/utils/build-usage-refusal-exception.util';
import { type UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentChatOperationType } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-plan.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// The fair-use ceiling is invisible to customers, so it must never surface as a limit they could manage
export const buildAgentChatTurnRefusalException = ({
  operationType,
  refusal,
  workspaceId,
}: {
  operationType: AgentChatOperationType;
  refusal: UsageRefusal;
  workspaceId: string;
}): AiException | BillingException | UsageLimitException => {
  if (
    operationType === UsageOperationType.AI_CHAT_INCLUDED &&
    refusal.kind === 'quotaExhausted' &&
    refusal.exhaustedScope.exhaustedKind === 'limit' &&
    refusal.exhaustedScope.operationType === UsageOperationType.AI_CHAT_INCLUDED
  ) {
    return new AiException(
      `Workspace ${workspaceId} reached its included AI chat fair-use limit`,
      AiExceptionCode.INCLUDED_CHAT_PAUSED,
    );
  }

  return buildUsageRefusalException({ usageRefusal: refusal, workspaceId });
};
