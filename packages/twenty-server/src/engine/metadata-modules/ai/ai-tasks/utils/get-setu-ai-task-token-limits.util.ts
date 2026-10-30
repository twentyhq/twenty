import {
  SETU_AI_TASK_TOKEN_LIMIT_PER_TASK_VARIABLE,
  SETU_AI_TASK_TOKEN_LIMITS,
  SETU_AI_TASK_WORKSPACE_DAILY_TOKEN_LIMIT_VARIABLE,
} from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-token-limits.constant';

const readPositiveInteger = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// Operators may lower or raise the limits; a missing or malformed value
// keeps the default rather than removing the ceiling.
export const getSetuAiTaskTokenLimits = (
  environment: NodeJS.ProcessEnv = process.env,
) => {
  const perTask = readPositiveInteger(
    environment[SETU_AI_TASK_TOKEN_LIMIT_PER_TASK_VARIABLE],
    SETU_AI_TASK_TOKEN_LIMITS.perTask,
  );

  return {
    perTask,
    perStepReservation: Math.min(
      SETU_AI_TASK_TOKEN_LIMITS.perStepReservation,
      perTask,
    ),
    perWorkspacePerDay: readPositiveInteger(
      environment[SETU_AI_TASK_WORKSPACE_DAILY_TOKEN_LIMIT_VARIABLE],
      SETU_AI_TASK_TOKEN_LIMITS.perWorkspacePerDay,
    ),
  };
};
