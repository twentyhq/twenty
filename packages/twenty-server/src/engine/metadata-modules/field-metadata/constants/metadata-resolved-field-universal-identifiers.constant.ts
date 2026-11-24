import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// TODO(charles): drop these fields' columns and index once 2.63 leaves the cross-upgrade window
export const METADATA_RESOLVED_FIELD_UNIVERSAL_IDENTIFIERS: readonly string[] = [
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.handle
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.handle
    .universalIdentifier,
];
