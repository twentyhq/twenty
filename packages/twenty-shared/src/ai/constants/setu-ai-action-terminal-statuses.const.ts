import { type SetuAiActionStatus } from '@/ai/constants/setu-ai-action-statuses.const';

export const SETU_AI_ACTION_TERMINAL_STATUSES: readonly SetuAiActionStatus[] = [
  'succeeded',
  'failed',
  'cancelled',
  'rejected',
  'superseded',
  'expired',
  'blocked',
];
