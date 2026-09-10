// TODO: derive default model preferences dynamically from the catalog
// instead of hardcoding model IDs that become stale as models evolve
//
// Each tier is resolved by taking the first model that is actually available,
// meaning the one whose provider the instance holds a key for. A chain is
// therefore a preference order across providers, not a shortlist: every
// supported provider needs an entry, or an instance configured with only that
// provider resolves the tier to nothing.
import { type AiModelTier } from 'twenty-shared/ai';

import { type AiModelPreferences } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-preferences.type';

export const DEFAULT_MODELS_BY_TIER: Record<AiModelTier, string[]> = {
  extraFast: [
    'google/gemini-3.5-flash-lite',
    'openai/gpt-5.4-nano',
    'anthropic/claude-haiku-4-5',
    'xai/grok-4.3',
    'mistral/mistral-small-latest',
  ],
  fast: [
    'openai/gpt-5.6-luna',
    'google/gemini-3.8-flash',
    'anthropic/claude-sonnet-5',
    'xai/grok-4.5',
    'mistral/mistral-medium-latest',
  ],
  balanced: [
    'openai/gpt-5.6-terra',
    'anthropic/claude-sonnet-5',
    'google/gemini-3.8-flash',
    'xai/grok-4.6',
    'mistral/mistral-large-latest',
  ],
  smart: [
    'openai/gpt-5.6-sol',
    'anthropic/claude-opus-5',
    'google/gemini-3.1-pro-preview',
    'xai/grok-4.6',
    'mistral/mistral-large-latest',
  ],
  extraSmart: [
    'openai/gpt-6-astra',
    'anthropic/claude-fable-5-1',
    'google/gemini-3.1-pro-preview@high',
    'xai/grok-4.6@xhigh',
    'mistral/mistral-large-latest',
  ],
};

export const DEFAULT_DISABLED_MODELS: string[] = [];

export const DEFAULT_MODEL_PREFERENCES: AiModelPreferences = {
  disabledModels: DEFAULT_DISABLED_MODELS,
  defaultModelsByTier: DEFAULT_MODELS_BY_TIER,
};
