import { isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FieldsHiddenOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/fields-hidden-on-matching-records.type';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

export const composeRecordFieldMetadataIds = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  objectFieldMetadataIds,
  records,
  fieldsHiddenOnMatchingRecords,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectFieldMetadataIds: string[];
  records: object[];
  fieldsHiddenOnMatchingRecords: FieldsHiddenOnMatchingRecords[];
}): Set<string> => {
  const fieldMetadataIds = new Set(objectFieldMetadataIds);

  for (const record of records) {
    const fieldMetadataIdsOfMatchingRules = fieldsHiddenOnMatchingRecords
      .filter(({ recordFilter }) =>
        isRecordMatchingFilter({
          record,
          filter: recordFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter: true,
        }),
      )
      .map(
        ({ fieldMetadataIds: ruleFieldMetadataIds }) => ruleFieldMetadataIds,
      );

    if (!isNonEmptyArray(fieldMetadataIdsOfMatchingRules)) {
      continue;
    }

    fieldMetadataIdsOfMatchingRules[0]
      .filter((fieldMetadataId) =>
        fieldMetadataIdsOfMatchingRules.every((ruleFieldMetadataIds) =>
          ruleFieldMetadataIds.includes(fieldMetadataId),
        ),
      )
      .forEach((fieldMetadataId) => fieldMetadataIds.add(fieldMetadataId));
  }

  return fieldMetadataIds;
};
