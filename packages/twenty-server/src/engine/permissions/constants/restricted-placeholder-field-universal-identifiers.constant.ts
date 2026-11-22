import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// TODO(@charlesBochet): revisit how unreadable fields are shown as a whole instead of maintaining this list
export const RESTRICTED_PLACEHOLDER_FIELD_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.message.fields.subject.universalIdentifier,
  STANDARD_OBJECTS.message.fields.text.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.fields.title.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.fields.description.universalIdentifier,
];
