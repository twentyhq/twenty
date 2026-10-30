export const SETU_AI_ACTION_STATUSES = [
  'pending_review',
  'queued',
  'running',
  'succeeded',
  'failed',
  'delivery_unknown',
  'cancelled',
  'rejected',
  'superseded',
  'expired',
  'blocked',
] as const;

export type SetuAiActionStatus = (typeof SETU_AI_ACTION_STATUSES)[number];
