export const SETU_AI_TASK_OPERATIONS = ['cancel'] as const;

export type SetuAiTaskOperation = (typeof SETU_AI_TASK_OPERATIONS)[number];
