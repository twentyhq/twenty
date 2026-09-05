export const getCalendarEventWebhookSyncDebounceCacheKey = ({
  calendarChannelId,
  workspaceId,
}: {
  calendarChannelId: string;
  workspaceId: string;
}): string =>
  `calendar-event-webhook-sync-debounce:${workspaceId}:${calendarChannelId}`;
