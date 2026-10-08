// Ascending; each model lists its own subset in the catalog since support differs even within a provider.
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
