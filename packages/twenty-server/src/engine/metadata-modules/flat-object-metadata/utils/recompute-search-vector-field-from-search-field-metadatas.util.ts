import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  buildSearchVectorTargetField,
  computeSearchVectorAsExpressionFromSearchFieldMetadatas,
} from 'src/engine/metadata-modules/flat-search-field-metadata/utils/compute-search-vector-as-expression-from-search-field-metadatas.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

type RecomputeSearchVectorFieldFromSearchFieldMetadatasArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  // Post-change field ids targeted by the object's searchFieldMetadata rows.
  searchFieldMetadataFieldIds: string[];
  // Takes precedence over the flat maps when resolving an id — for a field created or
  // renamed in the same migration, whose maps entry is absent or stale.
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

  const searchVectorField = objectFlatFieldMetadatas.find(
    (field) => field.name === SEARCH_VECTOR_FIELD.name,
  );

  if (
    !isDefined(searchVectorField) ||
    !isFlatFieldMetadataOfType(searchVectorField, FieldMetadataType.TS_VECTOR)
  ) {
    throw new ObjectMetadataException(
      `Search vector field not found for object metadata ${flatObjectMetadata.id}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

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

      return buildSearchVectorTargetField(
        flatFieldMetadata,
        flatFieldMetadata.id,
      );
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
  } catch (error) {
    throw new ObjectMetadataException(
      `Failed to compute search vector column expression for object metadata ${flatObjectMetadata.id}: ${error instanceof Error ? error.message : String(error)}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};
