export const getCalendarEventsToImportCacheKey = ({
  workspaceId,
  calendarChannelId,
}: {
  workspaceId: string;
  calendarChannelId: string;
}): string => `calendar-events-to-import:${workspaceId}:${calendarChannelId}`;
