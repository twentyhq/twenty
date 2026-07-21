import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

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
