// Preference lists use composite model ids (`provider/modelName`), aligned with the registry.
export type AiModelPreferences = {
  disabledModels?: string[];
  recommendedModels?: string[];
  defaultFastModels?: string[];
  defaultSmartModels?: string[];
};
