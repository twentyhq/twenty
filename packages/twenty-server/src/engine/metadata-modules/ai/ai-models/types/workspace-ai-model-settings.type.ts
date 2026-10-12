import { type AiModelTier } from 'twenty-shared/ai';

export type WorkspaceAiModelSettings = {
  isAutoModelSelectionEnabled: boolean;
  aiModelIdByTier: Partial<Record<AiModelTier, string>>;
  aiChatModelTier: AiModelTier;
  aiAgentModelTier: AiModelTier;
};
