import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-child-object-universal-identifiers.constant';

export const CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.message.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  ...CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS,
];
