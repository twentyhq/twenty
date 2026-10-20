import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';

// The searchFieldMetadata rows are the source of truth for a field's searchability:
// flatFieldMetadataMaps derives isSearchable from them. Resolving an existing row
// from the row map, instead of from the object's searchFieldMetadataUniversalIdentifiers
// list, keeps the lookup correct even when the object entity was built from a
// snapshot of the rows taken before the row was created.
export const findFlatSearchFieldMetadataIndexingField = ({
  flatSearchFieldMetadataMaps,
  fieldMetadataUniversalIdentifier,
  objectMetadataUniversalIdentifier,
}: {
  flatSearchFieldMetadataMaps: MetadataFlatEntityMaps<'searchFieldMetadata'>;
  fieldMetadataUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
}): MetadataFlatEntity<'searchFieldMetadata'> | undefined =>
  Object.values(flatSearchFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .find(
      (flatSearchFieldMetadata) =>
        flatSearchFieldMetadata.fieldMetadataUniversalIdentifier ===
          fieldMetadataUniversalIdentifier &&
        flatSearchFieldMetadata.objectMetadataUniversalIdentifier ===
          objectMetadataUniversalIdentifier,
    );
