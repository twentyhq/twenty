import { type AiDataPolicy, type AiModelTier } from 'twenty-shared/ai';

export type WorkspaceAiModelSettings = AiDataPolicy & {
  isAutoModelSelectionEnabled: boolean;
  aiModelIdByTier: Partial<Record<AiModelTier, string>>;
  aiChatModelTier: AiModelTier;
  aiAgentModelTier: AiModelTier;
};
