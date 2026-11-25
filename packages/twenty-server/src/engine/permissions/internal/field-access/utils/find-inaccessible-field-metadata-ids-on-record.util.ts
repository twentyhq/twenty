import { isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadataOptionMapsForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type InaccessibleFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/inaccessible-fields-on-matching-records.type';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

export const findInaccessibleFieldMetadataIdsOnRecord = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
  record,
  inaccessibleFieldsOnMatchingRecords,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
  record: object;
  inaccessibleFieldsOnMatchingRecords: InaccessibleFieldsOnMatchingRecords[];
}): string[] => {
  const inaccessibleFieldsOfMatchingRules = inaccessibleFieldsOnMatchingRecords
    .filter(({ recordFilter }) =>
      isRecordMatchingFilter({
        record,
        filter: recordFilter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps,
        shouldIgnoreSoftDeleteDefaultFilter: true,
      }),
    )
    .map(({ fieldMetadataIds }) => fieldMetadataIds);

  if (!isNonEmptyArray(inaccessibleFieldsOfMatchingRules)) {
    return [];
  }

  return inaccessibleFieldsOfMatchingRules[0].filter((fieldMetadataId) =>
    inaccessibleFieldsOfMatchingRules.every((fieldMetadataIds) =>
      fieldMetadataIds.includes(fieldMetadataId),
    ),
  );
};
