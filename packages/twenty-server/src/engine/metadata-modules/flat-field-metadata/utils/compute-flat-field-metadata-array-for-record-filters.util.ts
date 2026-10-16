import { isDefined, type RecordFilter } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const computeFlatFieldMetadataArrayForRecordFilters = ({
  flatFieldMetadataMaps,
  recordFilters,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  recordFilters: Pick<
    RecordFilter,
    'fieldMetadataId' | 'relationTargetFieldMetadataId'
  >[];
}): FlatFieldMetadata[] => {
  const recordFilterFieldMetadataIds = new Set(
    recordFilters
      .flatMap(({ fieldMetadataId, relationTargetFieldMetadataId }) => [
        fieldMetadataId,
        relationTargetFieldMetadataId,
      ])
      .filter(isDefined),
  );

  return [...recordFilterFieldMetadataIds]
    .map((fieldMetadataId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);
};
