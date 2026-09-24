import { type AiModelTier } from 'twenty-shared/ai';

// The subset of a workspace that decides which concrete model a tier resolves
// to. Pins are ignored while automatic selection is on.
export type WorkspaceAiModelSettings = {
  isAutoModelSelectionEnabled: boolean;
  aiModelIdByTier: Partial<Record<AiModelTier, string>>;
  aiChatModelTier: AiModelTier;
  aiAgentModelTier: AiModelTier;
};
