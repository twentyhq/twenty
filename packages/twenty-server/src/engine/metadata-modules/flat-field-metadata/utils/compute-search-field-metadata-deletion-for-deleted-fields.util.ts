import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

export const computeSearchFieldMetadataDeletionForDeletedFields = ({
  flatFieldMetadatasToDelete,
  flatObjectMetadataMaps,
  flatSearchFieldMetadataMaps,
}: {
  flatFieldMetadatasToDelete: FlatFieldMetadata[];
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatSearchFieldMetadataMaps'
>): {
  searchFieldMetadatasToDelete: UniversalFlatSearchFieldMetadata[];
} => {
  const deletedFieldIds = new Set(
    flatFieldMetadatasToDelete.map((flatFieldMetadata) => flatFieldMetadata.id),
  );
  const affectedObjectMetadataIds = new Set(
    flatFieldMetadatasToDelete.map(
      (flatFieldMetadata) => flatFieldMetadata.objectMetadataId,
    ),
  );

  const searchFieldMetadatasToDelete: UniversalFlatSearchFieldMetadata[] = [];

  for (const objectMetadataId of affectedObjectMetadataIds) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata) || !flatObjectMetadata.isSearchable) {
      continue;
    }

    const objectSearchFieldMetadatas =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow<FlatSearchFieldMetadata>({
        flatEntityMaps: flatSearchFieldMetadataMaps,
        flatEntityIds: flatObjectMetadata.searchFieldMetadataIds,
      });

    const rowsToDelete = objectSearchFieldMetadatas.filter(
      (searchFieldMetadata) =>
        deletedFieldIds.has(searchFieldMetadata.fieldMetadataId),
    );

    searchFieldMetadatasToDelete.push(...rowsToDelete);
  }

  return {
    searchFieldMetadatasToDelete,
  };
};
