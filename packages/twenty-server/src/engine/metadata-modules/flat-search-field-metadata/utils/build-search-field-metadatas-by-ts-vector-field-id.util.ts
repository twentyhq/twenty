import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

// Single O(total) pass grouping every search field by its tsVector field id.
// Built once per migration so each object creation can resolve its tsVector
// field's search fields in O(k) instead of re-scanning the whole map, turning
// the derivation from O(objectsCreated * totalSearchFields) into O(totalSearchFields).
export const buildSearchFieldMetadatasByTsVectorFieldId = (
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>,
): Map<string, FlatSearchFieldMetadata[]> => {
  const searchFieldMetadatasByTsVectorFieldId = new Map<
    string,
    FlatSearchFieldMetadata[]
  >();

  for (const flatSearchFieldMetadata of Object.values(
    flatSearchFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatSearchFieldMetadata)) {
      continue;
    }

    const { tsVectorFieldMetadataId } = flatSearchFieldMetadata;

    const existingSearchFieldMetadatas =
      searchFieldMetadatasByTsVectorFieldId.get(tsVectorFieldMetadataId) ?? [];

    existingSearchFieldMetadatas.push(flatSearchFieldMetadata);

    searchFieldMetadatasByTsVectorFieldId.set(
      tsVectorFieldMetadataId,
      existingSearchFieldMetadatas,
    );
  }

  return searchFieldMetadatasByTsVectorFieldId;
};
