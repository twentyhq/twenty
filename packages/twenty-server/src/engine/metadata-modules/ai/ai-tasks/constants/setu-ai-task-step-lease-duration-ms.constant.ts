// Longer than the step deadline, so a live worker always gives up its run
// before another one may take the step over.
export const SETU_AI_TASK_STEP_LEASE_DURATION_MS = 7 * 60_000;
