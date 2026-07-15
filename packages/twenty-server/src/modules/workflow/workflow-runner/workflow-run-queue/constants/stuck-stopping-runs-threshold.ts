// A run only stays in STOPPING while an in-flight worker execution finalizes it.
// If no worker is executing it (worker crashed, or the step is awaiting an
// external event that will never arrive), it never reaches STOPPED on its own.
// The threshold must stay above the longest legitimate step execution so we
// don't force-stop a run whose step is still genuinely running.
export const STUCK_STOPPING_RUNS_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
