// Campaign rows are machine-generated and nothing subscribes to them: no
// webhook, workflow trigger or timeline activity. Emitting would cost a
// snapshot SELECT of every row written plus a timeline row per recipient.
export const SKIP_EVENT_EMISSION = { shouldSkipEventEmission: true };
