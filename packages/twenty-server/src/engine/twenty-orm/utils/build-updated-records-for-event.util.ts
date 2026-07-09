import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWrittenFieldNamesFromColumns } from 'src/engine/twenty-orm/utils/get-written-field-names-from-columns.util';

const SYSTEM_FIELD_NAMES_ALWAYS_REGENERATED_ON_UPDATE = [
  'updatedAt',
  'searchVector',
];

export const buildUpdatedRecordsForEvent = ({
  persistedRecords,
  writtenColumnNamesByRecordIndex,
  recordsBeforeUpdateById,
  objectMetadataItem,
  flatFieldMetadataMaps,
}: {
  persistedRecords: ObjectLiteral[];
  writtenColumnNamesByRecordIndex: string[][];
  recordsBeforeUpdateById: Record<string, ObjectLiteral>;
  objectMetadataItem: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): { recordsAfter: ObjectLiteral[]; recordsBefore: ObjectLiteral[] } => {
  const recordsAfterUpdate: ObjectLiteral[] = [];
  const recordsBeforeUpdate: ObjectLiteral[] = [];

  for (const [recordIndex, persistedRecord] of persistedRecords.entries()) {
    const recordBeforeUpdate = recordsBeforeUpdateById[persistedRecord.id];

    if (!isDefined(recordBeforeUpdate)) {
      continue;
    }

    const writtenColumnNamesForRecord =
      writtenColumnNamesByRecordIndex[recordIndex] ?? [];
    const writtenFieldNamesForRecord = getWrittenFieldNamesFromColumns(
      writtenColumnNamesForRecord,
      objectMetadataItem,
      flatFieldMetadataMaps,
    );

    const reconstructedRecordAfterUpdate: ObjectLiteral = {
      ...recordBeforeUpdate,
    };

    for (const writtenFieldName of [
      ...writtenFieldNamesForRecord,
      ...SYSTEM_FIELD_NAMES_ALWAYS_REGENERATED_ON_UPDATE,
    ]) {
      if (writtenFieldName in persistedRecord) {
        reconstructedRecordAfterUpdate[writtenFieldName] =
          persistedRecord[writtenFieldName];
      }
    }

    for (const writtenColumnName of writtenColumnNamesForRecord) {
      if (writtenColumnName in persistedRecord) {
        reconstructedRecordAfterUpdate[writtenColumnName] =
          persistedRecord[writtenColumnName];
      }
    }

    recordsAfterUpdate.push(reconstructedRecordAfterUpdate);
    recordsBeforeUpdate.push(recordBeforeUpdate);
  }

  return {
    recordsAfter: recordsAfterUpdate,
    recordsBefore: recordsBeforeUpdate,
  };
};
