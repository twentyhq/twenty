export const SETU_AI_TASK_STEP_OPERATIONS = ['answer', 'retry'] as const;

export type SetuAiTaskStepOperation =
  (typeof SETU_AI_TASK_STEP_OPERATIONS)[number];
