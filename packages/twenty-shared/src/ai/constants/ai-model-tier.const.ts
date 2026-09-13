// Ordered from fastest and cheapest to most capable. The order is what the
// slider walks, so it must stay monotonic in both directions.
export const AI_MODEL_TIERS = [
  'extraFast',
  'fast',
  'balanced',
  'smart',
  'extraSmart',
] as const;

export type AiModelTier = (typeof AI_MODEL_TIERS)[number];
