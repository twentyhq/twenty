// Campaign rows are written in bulk and their events would fan out one per
// recipient, so the send path never emits them.
export const SKIP_EVENT_EMISSION = { shouldSkipEventEmission: true };
