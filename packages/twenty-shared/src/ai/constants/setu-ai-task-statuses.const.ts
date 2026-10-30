export const SETU_AI_TASK_STATUSES = [
  'queued',
  'running',
  'waiting_input',
  'waiting_approval',
  'completed',
  'partially_completed',
  'failed',
  'cancel_requested',
  'cancelled',
] as const;

export type SetuAiTaskStatus = (typeof SETU_AI_TASK_STATUSES)[number];
