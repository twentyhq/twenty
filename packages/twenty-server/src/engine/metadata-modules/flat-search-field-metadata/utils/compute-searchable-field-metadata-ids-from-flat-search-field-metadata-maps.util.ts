import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

// A field is searchable iff a searchFieldMetadata row targets it — same
// derivation the flat-field cache applies, exposed here for entity-backed
// read paths (REST controller, metadata resolvers) that bypass that cache.
export const computeSearchableFieldMetadataIdsFromFlatSearchFieldMetadataMaps =
  (
    flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>,
  ): Set<string> =>
    new Set(
      Object.values(flatSearchFieldMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map(
          (flatSearchFieldMetadata) => flatSearchFieldMetadata.fieldMetadataId,
        ),
    );
