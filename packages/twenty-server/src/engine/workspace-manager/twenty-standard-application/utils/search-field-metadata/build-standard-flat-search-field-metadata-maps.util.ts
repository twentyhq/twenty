import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { SEARCH_FIELDS_BY_STANDARD_OBJECT_NAME } from 'src/engine/workspace-manager/twenty-standard-application/constants/search-fields-by-standard-object-name.constant';
import { buildStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/build-standard-flat-search-field-metadatas.util';
import { type CreateStandardSearchFieldArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';

export const buildStandardFlatSearchFieldMetadataMaps = (
  args: Omit<CreateStandardSearchFieldArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatSearchFieldMetadata> => {
  const allSearchFieldMetadatas: FlatSearchFieldMetadata[] = (
    Object.keys(
      SEARCH_FIELDS_BY_STANDARD_OBJECT_NAME,
    ) as (keyof typeof SEARCH_FIELDS_BY_STANDARD_OBJECT_NAME)[]
  ).flatMap((objectName) =>
    buildStandardFlatSearchFieldMetadatas({
      ...args,
      objectName,
      searchFields: SEARCH_FIELDS_BY_STANDARD_OBJECT_NAME[objectName],
    }),
  );

  let flatSearchFieldMetadataMaps = createEmptyFlatEntityMaps();

  for (const searchFieldMetadata of allSearchFieldMetadatas) {
    flatSearchFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: searchFieldMetadata,
      flatEntityMaps: flatSearchFieldMetadataMaps,
    });
  }

  return flatSearchFieldMetadataMaps;
};
