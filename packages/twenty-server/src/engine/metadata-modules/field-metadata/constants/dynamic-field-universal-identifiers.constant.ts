import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

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
