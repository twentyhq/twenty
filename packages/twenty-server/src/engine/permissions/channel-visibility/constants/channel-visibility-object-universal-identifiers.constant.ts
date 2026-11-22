import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

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
  STANDARD_OBJECTS.attachment.universalIdentifier,
];
