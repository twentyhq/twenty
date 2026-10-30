// Development defaults. A step reserves its share before it runs, so
// concurrent tasks cannot together overspend the workspace's daily budget.
export const SETU_AI_TASK_TOKEN_LIMITS = {
  perTask: 600_000,
  perStepReservation: 200_000,
  perWorkspacePerDay: 3_000_000,
} as const;

export const SETU_AI_TASK_TOKEN_LIMIT_PER_TASK_VARIABLE =
  'SETU_AI_TASKS_TOKEN_LIMIT_PER_TASK';

export const SETU_AI_TASK_WORKSPACE_DAILY_TOKEN_LIMIT_VARIABLE =
  'SETU_AI_TASKS_WORKSPACE_DAILY_TOKEN_LIMIT';
