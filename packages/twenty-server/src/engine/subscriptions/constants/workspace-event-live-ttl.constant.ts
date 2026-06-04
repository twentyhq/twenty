// Presence TTL for a watched (workspace, table). Refreshed by the subscription
// heartbeat (every APPLICATION_KEEPALIVE_INTERVAL_MS); expires shortly after a
// subscriber disconnects, which stops the gated live publish.
export const WORKSPACE_EVENT_LIVE_TTL_MS = 60 * 1_000; // 60 seconds
