// Batched sub-requests each count against the per-user quota, so batching alone does not protect it.
export const GOOGLE_CALENDAR_BATCH_MIN_INTERVAL_MS = 6_250;
