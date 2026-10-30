import { type SetuAiTaskStatus } from '@/ai/constants/setu-ai-task-statuses.const';

export const SETU_AI_TASK_TERMINAL_STATUSES: readonly SetuAiTaskStatus[] = [
  'completed',
  'partially_completed',
  'failed',
  'cancelled',
];
