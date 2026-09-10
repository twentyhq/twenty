// TODO: derive default model preferences dynamically from the catalog
// instead of hardcoding model IDs that become stale as models evolve
//
// These lists are resolved by taking the first model that is actually
// available, meaning the one whose provider the instance holds a key for. They
// are therefore a preference chain across providers, not a shortlist: every
// supported provider needs an entry, or an instance configured with only that
// provider resolves to nothing and shows an empty model picker.
import { type AiModelPreferences } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-preferences.type';

export const DEFAULT_FAST_MODELS = [
  'openai/gpt-5.6-luna',
  'anthropic/claude-sonnet-5',
  'google/gemini-3.7-flash',
  'xai/grok-4.3',
  'mistral/mistral-large-latest',
];

export const DEFAULT_SMART_MODELS = [
  'openai/gpt-5.6-sol',
  'anthropic/claude-opus-5',
  'google/gemini-3.1-pro-preview',
  'xai/grok-4.6',
  'mistral/mistral-large-latest',
];

export const DEFAULT_RECOMMENDED_MODELS = [
  'openai/gpt-5.6-luna',
  'openai/gpt-5.6-sol',
  'anthropic/claude-sonnet-5',
  'anthropic/claude-opus-5',
  'google/gemini-3.1-pro-preview',
  'xai/grok-4.6',
  'mistral/mistral-large-latest',
];

export const DEFAULT_DISABLED_MODELS: string[] = [];

export const DEFAULT_MODEL_PREFERENCES: AiModelPreferences = {
  disabledModels: [],
  recommendedModels: DEFAULT_RECOMMENDED_MODELS,
  defaultFastModels: DEFAULT_FAST_MODELS,
  defaultSmartModels: DEFAULT_SMART_MODELS,
};
