import { type AiModelPreferences } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';
import { buildCompositeModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';
import { loadDefaultAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-ai-providers.util';

const DEFAULT_FAST_MODELS = [
  'openai/gpt-5-mini',
  'anthropic/claude-haiku-4-5-20251001',
  'google/gemini-3-flash-preview',
  'xai/grok-4-1-fast-reasoning',
  'mistral/mistral-large-latest',
];

const DEFAULT_SMART_MODELS = [
  'openai/gpt-5.2',
  'anthropic/claude-sonnet-4-6',
  'google/gemini-3.1-pro-preview',
  'xai/grok-4',
  'mistral/mistral-large-latest',
];

export const loadDefaultModelPreferences = (): AiModelPreferences => {
  const catalog = loadDefaultAiProviders();
  const recommendedModels: string[] = [];

  for (const [, config] of Object.entries(catalog)) {
    for (const model of config.models ?? []) {
      if (model.isRecommended) {
        recommendedModels.push(
          buildCompositeModelId(config.type, model.rawModelId),
        );
      }
    }
  }

  return {
    disabledModels: [],
    recommendedModels,
    defaultFastModels: DEFAULT_FAST_MODELS,
    defaultSmartModels: DEFAULT_SMART_MODELS,
  };
};
