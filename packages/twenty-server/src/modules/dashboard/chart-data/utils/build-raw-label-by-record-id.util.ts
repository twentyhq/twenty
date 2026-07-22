import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildRawLabelByRecordId = ({
  records,
  targetFlatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  records: Record<string, unknown>[];
  targetFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Map<string, string> => {
  const rawLabelByRecordId = new Map<string, string>();

  for (const record of records) {
    const recordId = String(record.id);
    const displayName = getRecordDisplayName(
      record,
      targetFlatObjectMetadata,
      flatFieldMetadataMaps,
    );

    const isDisplayNameFallingBackToRecordId = displayName === recordId;

    if (isDisplayNameFallingBackToRecordId) {
      continue;
    }

    rawLabelByRecordId.set(recordId, displayName);
  }

  return rawLabelByRecordId;
};
