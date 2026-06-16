import { type FieldMetadataType } from 'twenty-shared/types';
import { findOrThrow, isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { computeSearchVectorAsExpressionFromSearchFieldMetadatas } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/compute-search-vector-as-expression-from-search-field-metadatas.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

type RecomputeSearchVectorFieldFromSearchFieldMetadatasArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  // Post-change field metadata ids targeted by the object's searchFieldMetadata rows.
  searchFieldMetadataFieldIds: string[];
  // Field metadatas that should take precedence over the flat maps when resolving an
  // id (e.g. a field being created in the same migration is not yet in the maps, or a
  // renamed field whose maps entry still holds the old name).
  overrideFlatFieldMetadataById?: Map<string, FlatFieldMetadata>;
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;

export const recomputeSearchVectorFieldFromSearchFieldMetadatas = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  searchFieldMetadataFieldIds,
  overrideFlatFieldMetadataById,
}: RecomputeSearchVectorFieldFromSearchFieldMetadatasArgs):
  | FlatFieldMetadata<FieldMetadataType.TS_VECTOR>
  | undefined => {
  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldIds,
    });

  const searchVectorField = findOrThrow(
    objectFlatFieldMetadatas,
    (field) => field.name === SEARCH_VECTOR_FIELD.name,
  ) as FlatFieldMetadata<FieldMetadataType.TS_VECTOR>;

  const targetSearchableFields = searchFieldMetadataFieldIds.map(
    (fieldMetadataId) => {
      const overriddenFlatFieldMetadata =
        overrideFlatFieldMetadataById?.get(fieldMetadataId);

      const flatFieldMetadata =
        overriddenFlatFieldMetadata ??
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

      if (!isDefined(flatFieldMetadata)) {
        throw new ObjectMetadataException(
          `Field metadata ${fieldMetadataId} referenced by searchFieldMetadata not found for object metadata ${flatObjectMetadata.id}`,
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        );
      }

      return {
        name: flatFieldMetadata.name,
        type: flatFieldMetadata.type,
        createdAt: flatFieldMetadata.createdAt,
        sortKey: flatFieldMetadata.id,
      };
    },
  );

  try {
    const newAsExpression =
      computeSearchVectorAsExpressionFromSearchFieldMetadatas(
        targetSearchableFields,
      );

    return {
      ...searchVectorField,
      universalSettings: {
        ...searchVectorField.universalSettings,
        asExpression: newAsExpression,
        generatedType: 'STORED',
      },
    };
  } catch {
    throw new ObjectMetadataException(
      `Failed to compute search vector column expression for object metadata ${flatObjectMetadata.id}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};
