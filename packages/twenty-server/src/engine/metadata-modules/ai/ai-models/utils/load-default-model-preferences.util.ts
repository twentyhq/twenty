// TODO: derive default model preferences dynamically from the catalog
// instead of hardcoding model IDs that become stale as models evolve
//
// Each tier is resolved by taking the first model that is actually available,
// meaning the one whose provider the instance holds a key for. A chain is
// therefore a preference order across providers, not a shortlist: every
// supported provider needs an entry, or an instance configured with only that
// provider resolves the tier to nothing.
import { type AiModelTier } from 'twenty-shared/ai';

// Efforts are pinned so a tier runs at the effort its benchmark was measured
// at, and so one model family can back neighbouring tiers at different speeds.
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
    'anthropic/claude-fable-5-1@xhigh',
    'xai/grok-4.6@xhigh',
    'mistral/mistral-large-latest',
  ],
};

export const DEFAULT_DISABLED_MODELS: string[] = [];
