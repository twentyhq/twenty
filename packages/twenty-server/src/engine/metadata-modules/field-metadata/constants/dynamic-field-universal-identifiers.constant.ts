import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// TODO: drop the accountOwnerId and handle columns and the accountOwnerId index of both
// channel associations once 2.63 leaves the cross-upgrade window (its command still backfills them)
export const DYNAMIC_FIELD_UNIVERSAL_IDENTIFIERS: readonly string[] = [
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.handle
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.handle
    .universalIdentifier,
];
