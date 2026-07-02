import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildSearchFieldMetadatasByTsVectorFieldId } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-search-field-metadatas-by-ts-vector-field-id.util';

// Scoped alternative to the warmed-up optimistic aggregator design in
// https://github.com/twentyhq/core-team-issues/issues/2622. Prefer implementing
// that centralized cache if a second create-before-parent consumer re-occurs.

export type SearchFieldMetadatasByTsVectorFieldIdAccessor = {
  get: (tsVectorFieldMetadataId: string) => FlatSearchFieldMetadata[];
  invalidate: () => void;
};

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
