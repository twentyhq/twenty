import { isDefined } from 'twenty-shared/utils';

import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentChatTurnPlan } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-plan.type';

// A paid turn is not refused upfront: it runs until a step exhausts the allowance
export const isAgentChatIncludedTurnRefused = <
  TTurnPlan extends Pick<AgentChatTurnPlan, 'operationType' | 'refusal'>,
>(
  turnPlan: TTurnPlan,
): turnPlan is TTurnPlan & { refusal: UsageRefusal } =>
  turnPlan.operationType === UsageOperationType.AI_CHAT_INCLUDED &&
  isDefined(turnPlan.refusal);
