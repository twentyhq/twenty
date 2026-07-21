import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

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
