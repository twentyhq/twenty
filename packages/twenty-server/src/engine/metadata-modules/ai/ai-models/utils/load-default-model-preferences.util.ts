// TODO: derive default model preferences from the catalog instead of hardcoding ids
// every supported provider needs an entry, or a single-provider instance resolves the tier to nothing
import { type AiModelTier } from 'twenty-shared/ai';

// efforts match the benchmarked effort and let one family back neighbouring tiers
export const DEFAULT_MODELS_BY_TIER: Record<AiModelTier, string[]> = {
  extraFast: [
    'openai/gpt-5.6-luna@low',
    'google/gemini-3.8-flash@low',
    'anthropic/claude-sonnet-5@low',
    'xai/grok-4.5@low',
    'mistral/mistral-small-latest@none',
  ],
  fast: [
    'openai/gpt-5.6-luna@medium',
    'google/gemini-3.8-flash@medium',
    'anthropic/claude-sonnet-5@medium',
    'xai/grok-4.5@medium',
    'mistral/mistral-medium-latest',
  ],
  balanced: [
    'openai/gpt-5.6-luna@high',
    'google/gemini-3.8-flash@high',
    'anthropic/claude-sonnet-5@high',
    'xai/grok-4.6@medium',
    'mistral/mistral-large-latest',
  ],
  smart: [
    'openai/gpt-5.6-sol@high',
    'google/gemini-3.8-flash@high',
    'anthropic/claude-opus-5@high',
    'xai/grok-4.6@high',
    'mistral/mistral-large-latest',
  ],
  extraSmart: [
    'openai/gpt-6-astra@xhigh',
    'google/gemini-3.8-flash@high',
    'anthropic/claude-opus-5-5',
    'xai/grok-4.6@xhigh',
    'mistral/mistral-large-latest',
  ],
};

export const DEFAULT_DISABLED_MODELS: string[] = [];
