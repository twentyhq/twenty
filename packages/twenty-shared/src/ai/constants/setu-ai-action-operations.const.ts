export const SETU_AI_ACTION_OPERATIONS = [
  'revise',
  'approve',
  'reject',
  'cancel',
] as const;

export type SetuAiActionOperation = (typeof SETU_AI_ACTION_OPERATIONS)[number];
