// Presence TTL for a watched (workspace, table); refreshed by the subscription heartbeat, expires shortly after disconnect.
export const WORKSPACE_EVENT_LIVE_TTL_MS = 60 * 1_000;
