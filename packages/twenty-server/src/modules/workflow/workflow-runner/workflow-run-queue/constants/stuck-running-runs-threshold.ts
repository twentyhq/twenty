// updatedAt refreshes on every step-info write, so a RUNNING run whose
// updatedAt is older than this threshold has made no progress at all: either
// its queue job is still alive (checked separately) or the job was lost.
export const STUCK_RUNNING_RUNS_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
