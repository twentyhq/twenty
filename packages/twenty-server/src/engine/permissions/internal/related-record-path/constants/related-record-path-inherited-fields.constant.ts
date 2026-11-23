/* @license Enterprise */

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// Each field copies a field of the records whose related record path grants it, so it is readable only through a source that shows that field
export const RELATED_RECORD_PATH_INHERITED_FIELDS = [
  {
    fieldUniversalIdentifier:
      STANDARD_OBJECTS.messageThread.fields.subject.universalIdentifier,
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.message.fields.subject.universalIdentifier,
  },
];
