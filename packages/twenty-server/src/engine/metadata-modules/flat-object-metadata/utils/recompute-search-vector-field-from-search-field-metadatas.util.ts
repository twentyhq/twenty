import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
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
  // Post-change searchFieldMetadata rows for the object, carrying the indexed field id,
  // the per-object position driving the deterministic asExpression order, and the FK to
  // the TS_VECTOR field they feed (the authoritative grouping key).
  searchFieldMetadatas: Pick<
    FlatSearchFieldMetadata,
    | 'fieldMetadataId'
    | 'position'
    | 'universalIdentifier'
    | 'tsVectorFieldMetadataId'
  >[];
  // Takes precedence over the flat maps when resolving an id — for a field created or
  // renamed in the same migration, whose maps entry is absent or stale.
  overrideFlatFieldMetadataById?: Map<string, FlatFieldMetadata>;
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;

// Resolves the TS_VECTOR field the rows feed. Today every row of an object points at the
// same vector, so we group on the FK and resolve that single target. Falls back to the
// object's system searchVector field by name only when there are no rows left to read the
// FK from (e.g. every indexed field was deleted), so an emptied surface still clears it.
const resolveTargetSearchVectorField = ({
  targetTsVectorFieldMetadataId,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  overrideFlatFieldMetadataById,
}: {
  targetTsVectorFieldMetadataId: string | undefined;
} & Pick<
  RecomputeSearchVectorFieldFromSearchFieldMetadatasArgs,
  | 'flatObjectMetadata'
  | 'flatFieldMetadataMaps'
  | 'overrideFlatFieldMetadataById'
>): FlatFieldMetadata | undefined => {
  if (isDefined(targetTsVectorFieldMetadataId)) {
    return (
      overrideFlatFieldMetadataById?.get(targetTsVectorFieldMetadataId) ??
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: targetTsVectorFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    );
  }

  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldIds,
    });

  return objectFlatFieldMetadatas.find(
    (field) => field.name === SEARCH_VECTOR_FIELD.name,
  );
};

export const recomputeSearchVectorFieldFromSearchFieldMetadatas = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  searchFieldMetadatas,
  overrideFlatFieldMetadataById,
}: RecomputeSearchVectorFieldFromSearchFieldMetadatasArgs):
  | FlatFieldMetadata<FieldMetadataType.TS_VECTOR>
  | undefined => {
  const targetTsVectorFieldMetadataId =
    searchFieldMetadatas[0]?.tsVectorFieldMetadataId;

  const targetSearchFieldMetadatas = isDefined(targetTsVectorFieldMetadataId)
    ? searchFieldMetadatas.filter(
        (searchFieldMetadata) =>
          searchFieldMetadata.tsVectorFieldMetadataId ===
          targetTsVectorFieldMetadataId,
      )
    : searchFieldMetadatas;

  const searchVectorField = resolveTargetSearchVectorField({
    targetTsVectorFieldMetadataId,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    overrideFlatFieldMetadataById,
  });

  if (
    !isDefined(searchVectorField) ||
    !isFlatFieldMetadataOfType(searchVectorField, FieldMetadataType.TS_VECTOR)
  ) {
    throw new ObjectMetadataException(
      `Search vector field not found for object metadata ${flatObjectMetadata.id}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

  const targetSearchableFields = targetSearchFieldMetadatas.map(
    (searchFieldMetadata) => {
      const { fieldMetadataId, position, universalIdentifier } =
        searchFieldMetadata;

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
        position,
        universalIdentifier,
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
