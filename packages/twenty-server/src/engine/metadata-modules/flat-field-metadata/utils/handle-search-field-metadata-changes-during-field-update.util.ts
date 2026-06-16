import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeSearchVectorFieldFromSearchFieldMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-search-vector-field-from-search-field-metadatas.util';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

export type FieldMetadataUpdateSearchFieldMetadataSideEffect = {
  searchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[];
  searchFieldMetadatasToDelete: UniversalFlatSearchFieldMetadata[];
  flatSearchVectorFieldToUpdate:
    | FlatFieldMetadata<FieldMetadataType.TS_VECTOR>
    | undefined;
};

type HandleSearchFieldMetadataChangesDuringFieldUpdateArgs = {
  flatObjectMetadata: FlatObjectMetadata;
} & FromTo<FlatFieldMetadata, 'flatFieldMetadata'> &
  Pick<
    AllFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatSearchFieldMetadataMaps'
  >;

const EMPTY_SIDE_EFFECT: FieldMetadataUpdateSearchFieldMetadataSideEffect = {
  searchFieldMetadatasToCreate: [],
  searchFieldMetadatasToDelete: [],
  flatSearchVectorFieldToUpdate: undefined,
};

export const handleSearchFieldMetadataChangesDuringFieldUpdate = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
}: HandleSearchFieldMetadataChangesDuringFieldUpdateArgs): FieldMetadataUpdateSearchFieldMetadataSideEffect => {
  if (!flatObjectMetadata.isSearchable) {
    return EMPTY_SIDE_EFFECT;
  }

  const objectSearchFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow<FlatSearchFieldMetadata>({
      flatEntityMaps: flatSearchFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.searchFieldMetadataIds,
    });

  const existingSearchFieldMetadata = objectSearchFieldMetadatas.find(
    (searchFieldMetadata) =>
      searchFieldMetadata.fieldMetadataId === toFlatFieldMetadata.id,
  );

  const wasSearchable = isDefined(existingSearchFieldMetadata);
  const isSearchable =
    isSearchableFieldType(toFlatFieldMetadata.type) &&
    // Renaming a non-searchable field must not retroactively make it searchable.
    (wasSearchable || isSearchableFieldType(fromFlatFieldMetadata.type));

  const hasNameChanged =
    fromFlatFieldMetadata.name !== toFlatFieldMetadata.name;
  const hasTypeChanged =
    fromFlatFieldMetadata.type !== toFlatFieldMetadata.type;

  const currentFieldIds = objectSearchFieldMetadatas.map(
    (searchFieldMetadata) => searchFieldMetadata.fieldMetadataId,
  );

  // searchable -> non-searchable: drop the row and recompute without the field.
  if (
    wasSearchable &&
    hasTypeChanged &&
    !isSearchableFieldType(toFlatFieldMetadata.type)
  ) {
    const searchFieldMetadataFieldIds = currentFieldIds.filter(
      (fieldMetadataId) => fieldMetadataId !== toFlatFieldMetadata.id,
    );

    return {
      searchFieldMetadatasToCreate: [],
      searchFieldMetadatasToDelete: [existingSearchFieldMetadata],
      flatSearchVectorFieldToUpdate:
        recomputeSearchVectorFieldFromSearchFieldMetadatas({
          flatObjectMetadata,
          flatFieldMetadataMaps,
          searchFieldMetadataFieldIds,
        }),
    };
  }

  // non-searchable -> searchable: create a row and recompute including the field.
  if (!wasSearchable && isSearchable) {
    const searchFieldMetadataToCreate = buildFlatSearchFieldMetadataForField({
      flatObjectMetadata,
      flatFieldMetadata: toFlatFieldMetadata,
    });

    const searchFieldMetadataFieldIds = [
      ...currentFieldIds,
      toFlatFieldMetadata.id,
    ];

    return {
      searchFieldMetadatasToCreate: [searchFieldMetadataToCreate],
      searchFieldMetadatasToDelete: [],
      flatSearchVectorFieldToUpdate:
        recomputeSearchVectorFieldFromSearchFieldMetadatas({
          flatObjectMetadata,
          flatFieldMetadataMaps,
          searchFieldMetadataFieldIds,
          // The renamed/updated field carries the post-change name/type.
          overrideFlatFieldMetadataById: new Map([
            [toFlatFieldMetadata.id, toFlatFieldMetadata],
          ]),
        }),
    };
  }

  // Rename of a searchable field with an existing row: recompute (asExpression
  // embeds the column name), no row change.
  if (wasSearchable && hasNameChanged) {
    return {
      searchFieldMetadatasToCreate: [],
      searchFieldMetadatasToDelete: [],
      flatSearchVectorFieldToUpdate:
        recomputeSearchVectorFieldFromSearchFieldMetadatas({
          flatObjectMetadata,
          flatFieldMetadataMaps,
          searchFieldMetadataFieldIds: currentFieldIds,
          overrideFlatFieldMetadataById: new Map([
            [toFlatFieldMetadata.id, toFlatFieldMetadata],
          ]),
        }),
    };
  }

  return EMPTY_SIDE_EFFECT;
};
