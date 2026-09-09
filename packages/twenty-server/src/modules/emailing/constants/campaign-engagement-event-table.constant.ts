export const CAMPAIGN_ENGAGEMENT_EVENT_TABLE = 'messageEngagementEvent';

// One part per second at most under any load; a shorter flush floods
// ClickHouse with tiny parts during a campaign blast.
export const CAMPAIGN_ENGAGEMENT_INSERT_BUSY_TIMEOUT_MS = 1_000;
