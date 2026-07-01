import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

// O(total) scan over the whole search-field map, filtered to a single tsVector
// field. Fine for callers that resolve one tsVector field in isolation (export
// DDL, single field-update rebuild) where the one-off cost is negligible. The
// migration runner instead uses buildSearchFieldMetadatasByTsVectorFieldId to
// avoid re-scanning per created object.
export const getTargetSearchFieldMetadatasForTsVectorField = ({
  tsVectorFieldMetadataId,
  flatSearchFieldMetadataMaps,
}: {
  tsVectorFieldMetadataId: string;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
}): FlatSearchFieldMetadata[] =>
  Object.values(flatSearchFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatSearchFieldMetadata) =>
        flatSearchFieldMetadata.tsVectorFieldMetadataId ===
        tsVectorFieldMetadataId,
    );
