// Every effort level a supported provider accepts, in ascending order. A model
// lists the subset it takes in the catalog, since the set differs per model even
// within one provider.
export const AI_MODEL_EFFORTS = [
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
] as const;

export type AiModelEffort = (typeof AI_MODEL_EFFORTS)[number];
