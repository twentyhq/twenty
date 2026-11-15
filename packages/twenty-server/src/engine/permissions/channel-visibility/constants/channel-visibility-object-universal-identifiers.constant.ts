import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// records of these objects are reached through channel visibility rules or through the record they hang from, never through a role wide grant
export const CHANNEL_VISIBILITY_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.message.universalIdentifier,
  STANDARD_OBJECTS.messageThread.universalIdentifier,
  STANDARD_OBJECTS.messageParticipant.universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociationMessageFolder
    .universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  STANDARD_OBJECTS.calendarEventParticipant.universalIdentifier,
  STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
  // a role reaches attachments through the system rule that leaves out the ones of a message
  STANDARD_OBJECTS.attachment.universalIdentifier,
];
