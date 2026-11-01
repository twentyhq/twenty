import { isDefined, type RecordFilter } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const findRecordFilterWithMissingField = ({
  recordFilters,
  flatFieldMetadataMaps,
}: {
  recordFilters: Pick<
    RecordFilter,
    'fieldMetadataId' | 'relationTargetFieldMetadataId'
  >[];
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'universalIdentifierById'
  >;
}) => {
  const isExistingField = (fieldMetadataId: string) =>
    isDefined(flatFieldMetadataMaps.universalIdentifierById[fieldMetadataId]);

  return recordFilters.find(
    (recordFilter) =>
      !isExistingField(recordFilter.fieldMetadataId) ||
      (isDefined(recordFilter.relationTargetFieldMetadataId) &&
        !isExistingField(recordFilter.relationTargetFieldMetadataId)),
  );
};
