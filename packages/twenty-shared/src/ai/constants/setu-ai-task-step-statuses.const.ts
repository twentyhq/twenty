export const SETU_AI_TASK_STEP_STATUSES = [
  'queued',
  'running',
  'waiting_input',
  'completed',
  'failed',
  'cancelled',
] as const;

export type SetuAiTaskStepStatus = (typeof SETU_AI_TASK_STEP_STATUSES)[number];
