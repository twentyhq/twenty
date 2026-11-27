import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// TODO(@charlesBochet): remove after 2026-12-27. Temporary channel write access for admins and API keys, only to unblock customers who reported broken links, merges and deletes
export const CHANNEL_WRITE_ACCESS_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.message.universalIdentifier,
  STANDARD_OBJECTS.messageParticipant.universalIdentifier,
  STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  STANDARD_OBJECTS.calendarEventParticipant.universalIdentifier,
  STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
];
