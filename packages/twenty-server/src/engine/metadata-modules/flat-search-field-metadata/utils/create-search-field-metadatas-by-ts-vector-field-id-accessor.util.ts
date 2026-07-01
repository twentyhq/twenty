import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildSearchFieldMetadatasByTsVectorFieldId } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-search-field-metadatas-by-ts-vector-field-id.util';

export type SearchFieldMetadatasByTsVectorFieldIdAccessor = {
  get: (tsVectorFieldMetadataId: string) => FlatSearchFieldMetadata[];
  invalidate: () => void;
};

// Memoized accessor over the grouped search-field index. Builds the index once
// on the first read and reuses it, so per-object derivation is O(k) instead of
// re-scanning the whole map. `invalidate()` must be called whenever the
// search-field map changes so the next read rebuilds from the current state —
// this is what keeps the index correct without depending on searchFieldMetadata
// actions being ordered before objectMetadata creates. The maps are read through
// a getter so the accessor always sees the latest (reassigned) maps reference.
export const createSearchFieldMetadatasByTsVectorFieldIdAccessor = (
  getFlatSearchFieldMetadataMaps: () => FlatEntityMaps<FlatSearchFieldMetadata>,
): SearchFieldMetadatasByTsVectorFieldIdAccessor => {
  let searchFieldMetadatasByTsVectorFieldId:
    | Map<string, FlatSearchFieldMetadata[]>
    | undefined;

  return {
    get: (tsVectorFieldMetadataId) => {
      searchFieldMetadatasByTsVectorFieldId ??=
        buildSearchFieldMetadatasByTsVectorFieldId(
          getFlatSearchFieldMetadataMaps(),
        );

      return (
        searchFieldMetadatasByTsVectorFieldId.get(tsVectorFieldMetadataId) ?? []
      );
    },
    invalidate: () => {
      searchFieldMetadatasByTsVectorFieldId = undefined;
    },
  };
};
