import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type RelatedRecordPathInheritedFieldDefinition } from 'src/engine/permissions/internal/related-record-path/utils/find-related-record-path-inherited-fields.util';

export const CHANNEL_VISIBILITY_RELATED_RECORD_PATH_INHERITED_FIELDS: RelatedRecordPathInheritedFieldDefinition[] =
  [
    {
      fieldUniversalIdentifier:
        STANDARD_OBJECTS.messageThread.fields.subject.universalIdentifier,
      sourceFieldUniversalIdentifier:
        STANDARD_OBJECTS.message.fields.subject.universalIdentifier,
    },
  ];
