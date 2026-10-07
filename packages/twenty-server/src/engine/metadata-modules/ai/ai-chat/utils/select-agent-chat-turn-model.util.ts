import { isIncludedAiModelVariant } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentChatTurnPlan } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-plan.type';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

export const selectAgentChatTurnModel = ({
  requestedModel,
  includedModel,
  isFollowingWorkspaceTier,
  isAllowanceExhausted,
}: {
  requestedModel: RegisteredAiModel;
  includedModel: RegisteredAiModel | null;
  isFollowingWorkspaceTier: boolean;
  isAllowanceExhausted: boolean;
}): Pick<AgentChatTurnPlan, 'registeredModel' | 'operationType'> => {
  if (!isDefined(includedModel)) {
    return {
      registeredModel: requestedModel,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    };
  }

  if (
    isIncludedAiModelVariant({
      modelId: requestedModel.modelId,
      includedModelId: includedModel.modelId,
    })
  ) {
    return {
      registeredModel: requestedModel,
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
    };
  }

  // A tier picked on the slider is an explicit choice, so only a send that follows the workspace tier switches
  if (isFollowingWorkspaceTier && isAllowanceExhausted) {
    return {
      registeredModel: includedModel,
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
    };
  }

  return {
    registeredModel: requestedModel,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
  };
};
