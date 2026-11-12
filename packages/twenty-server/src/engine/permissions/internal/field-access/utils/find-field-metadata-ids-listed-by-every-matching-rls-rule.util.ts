import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

export const findFieldMetadataIdsListedByEveryMatchingRlsRule = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  record,
  rlsRuleFieldLists,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  record: object;
  rlsRuleFieldLists: {
    fieldMetadataIds: string[];
    recordFilter: RecordGqlOperationFilter;
  }[];
}): string[] => {
  const fieldListsOfMatchingRules = rlsRuleFieldLists
    .filter(({ recordFilter }) =>
      isRecordMatchingFilter({
        record,
        filter: recordFilter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter: true,
      }),
    )
    .map(({ fieldMetadataIds }) => fieldMetadataIds);

  if (!isNonEmptyArray(fieldListsOfMatchingRules)) {
    return [];
  }

  return fieldListsOfMatchingRules[0].filter((fieldMetadataId) =>
    fieldListsOfMatchingRules.every((fieldMetadataIds) =>
      fieldMetadataIds.includes(fieldMetadataId),
    ),
  );
};
