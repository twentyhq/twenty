import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

export type AgentChatOperationType =
  | UsageOperationType.AI_CHAT_TOKEN
  | UsageOperationType.AI_CHAT_INCLUDED;

export type AgentChatTurnPlan = {
  registeredModel: RegisteredAiModel;
  operationType: AgentChatOperationType;
  refusal: UsageRefusal | null;
};
