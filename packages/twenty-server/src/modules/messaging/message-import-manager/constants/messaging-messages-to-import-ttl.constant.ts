// Long enough for a throttled historical backfill to drain: every list fetch
// and every retried batch refreshes it, so only an idle channel ever expires
// with ids still queued.
export const MESSAGING_MESSAGES_TO_IMPORT_TTL = 7 * 24 * 60 * 60 * 1000;
