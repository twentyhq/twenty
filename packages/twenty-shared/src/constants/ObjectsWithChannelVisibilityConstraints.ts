// TODO: These objects are tied to connected accounts and have channel-based visibility
// settings (MessageChannelVisibility / CalendarChannelVisibility) that control what data
// workspace members can see. The global search service does not yet enforce these visibility
// rules, so we exclude these objects from explicit search inclusion to prevent leaking
// restricted content (e.g. message subjects, calendar event titles).
// Once the search service properly joins channel tables and applies visibility filtering,
// this list can be removed.
export const OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS = [
  'blocklist',
  'message',
  'messageThread',
  'messageParticipant',
  'messageChannelMessageAssociation',
  'messageChannelMessageAssociationMessageFolder',
  'messageThreadSubscriber',
  'calendarEvent',
  'calendarChannelEventAssociation',
  'calendarEventParticipant',
] as const;
