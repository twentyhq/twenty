// The slider walks this order, so it must stay monotonic from fastest and cheapest to most capable.
export const AI_MODEL_TIERS = [
  'extraFast',
  'fast',
  'balanced',
  'smart',
  'extraSmart',
] as const;

export type AiModelTier = (typeof AI_MODEL_TIERS)[number];
