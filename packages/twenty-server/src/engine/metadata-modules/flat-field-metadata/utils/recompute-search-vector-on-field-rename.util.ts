import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeSearchVectorFieldFromSearchFieldMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-search-vector-field-from-search-field-metadatas.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

export type FieldMetadataUpdateSearchVectorSideEffect = {
  flatSearchVectorFieldToUpdate:
    | FlatFieldMetadata<FieldMetadataType.TS_VECTOR>
    | undefined;
};

type RecomputeSearchVectorOnFieldRenameArgs = {
  flatObjectMetadata: FlatObjectMetadata;
} & FromTo<FlatFieldMetadata, 'flatFieldMetadata'> &
  Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps' | 'flatSearchFieldMetadataMaps'>;

const EMPTY_SIDE_EFFECT: FieldMetadataUpdateSearchVectorSideEffect = {
  flatSearchVectorFieldToUpdate: undefined,
};

// The search surface is provisioned once at object creation (default label identifier for
// custom objects, SEARCH_FIELDS_FOR_* for standard objects). A field update never adds or
// removes searchFieldMetadata rows; it only recomputes the searchVector asExpression when an
// already-indexed field is renamed, since the expression embeds the field's column name.
export const recomputeSearchVectorOnFieldRename = ({
  fromFlatFieldMetadata,
  toFlatFieldMetadata,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
}: RecomputeSearchVectorOnFieldRenameArgs): FieldMetadataUpdateSearchVectorSideEffect => {
  if (!flatObjectMetadata.isSearchable) {
    return EMPTY_SIDE_EFFECT;
  }

  const objectSearchFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow<FlatSearchFieldMetadata>({
      flatEntityMaps: flatSearchFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.searchFieldMetadataIds,
    });

  const isIndexedField = objectSearchFieldMetadatas.some(
    (searchFieldMetadata) =>
      searchFieldMetadata.fieldMetadataId === toFlatFieldMetadata.id,
  );

  const hasNameChanged =
    fromFlatFieldMetadata.name !== toFlatFieldMetadata.name;

  if (!isIndexedField || !hasNameChanged) {
    return EMPTY_SIDE_EFFECT;
  }

  const searchFieldMetadataFieldIds = objectSearchFieldMetadatas.map(
    (searchFieldMetadata) => searchFieldMetadata.fieldMetadataId,
  );

  return {
    flatSearchVectorFieldToUpdate:
      recomputeSearchVectorFieldFromSearchFieldMetadatas({
        flatObjectMetadata,
        flatFieldMetadataMaps,
        searchFieldMetadataFieldIds,
        overrideFlatFieldMetadataById: new Map([
          [toFlatFieldMetadata.id, toFlatFieldMetadata],
        ]),
      }),
  };
};
