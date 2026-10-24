import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FieldValueSnapshotField } from 'src/engine/metadata-modules/permissions/types/field-value-snapshot-field.type';

export const FIELD_VALUE_SNAPSHOT_FIELDS: FieldValueSnapshotField[] = [
  {
    snapshotFieldUniversalIdentifier:
      STANDARD_OBJECTS.timelineActivity.fields.properties.universalIdentifier,
    subjectObjectMetadataIdFieldUniversalIdentifier:
      STANDARD_OBJECTS.timelineActivity.fields.linkedObjectMetadataId
        .universalIdentifier,
    subjectMorphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
  },
];
