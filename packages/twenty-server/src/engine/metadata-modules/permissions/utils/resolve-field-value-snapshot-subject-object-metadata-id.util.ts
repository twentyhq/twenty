import { isNonEmptyString } from '@sniptt/guards';

import { type ResolvedFieldValueSnapshotField } from 'src/engine/metadata-modules/permissions/types/resolved-field-value-snapshot-field.type';

export const resolveFieldValueSnapshotSubjectObjectMetadataId = ({
  record,
  snapshotField,
}: {
  record: Record<string, unknown>;
  snapshotField: ResolvedFieldValueSnapshotField;
}): string | undefined => {
  const linkedObjectMetadataId =
    record[snapshotField.subjectObjectMetadataIdFieldName];

  if (isNonEmptyString(linkedObjectMetadataId)) {
    return linkedObjectMetadataId;
  }

  return snapshotField.subjectJoinColumns.find(({ joinColumnName }) =>
    isNonEmptyString(record[joinColumnName]),
  )?.objectMetadataId;
};
