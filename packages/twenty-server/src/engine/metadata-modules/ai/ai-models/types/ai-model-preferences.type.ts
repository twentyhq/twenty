import { type AiModelTier } from 'twenty-shared/ai';

// Instance-level preferences. Model ids are composite (`provider/modelName`),
// optionally pinned to an effort as `provider/modelName@effort`.
export type AiModelPreferences = {
  disabledModels: string[];
  defaultModelsByTier: Record<AiModelTier, string[]>;
};
