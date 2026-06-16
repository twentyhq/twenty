import { type FieldMetadataType } from 'twenty-shared/types';
import {
  findOrThrow,
  fromArrayToValuesByKeyRecord,
  isDefined,
  isSearchableFieldType,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  buildSearchVectorTargetField,
  computeSearchVectorAsExpressionFromSearchFieldMetadatas,
} from 'src/engine/metadata-modules/flat-search-field-metadata/utils/compute-search-vector-as-expression-from-search-field-metadatas.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

type ComputeSearchFieldMetadataCreationForFieldsArgs = {
  // Universal flat field metadatas being created in this migration (multiple fields,
  // possibly across several objects). The new fields are not yet in the flat maps.
  flatFieldMetadatasToCreate: UniversalFlatFieldMetadata[];
} & Pick<
  AllFlatEntityMaps,
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatSearchFieldMetadataMaps'
>;

// Headline of the field lifecycle: when a searchable-type field is created on an
// isSearchable object, it is auto-included in global search. This emits one
// searchFieldMetadata row per such field and the recomputed searchVector field
// (existing rows' fields + the newly created fields) per affected object.
export const computeSearchFieldMetadataCreationForFields = ({
  flatFieldMetadatasToCreate,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
}: ComputeSearchFieldMetadataCreationForFieldsArgs): {
  searchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[];
  flatSearchVectorFieldsToUpdate: FlatFieldMetadata<FieldMetadataType.TS_VECTOR>[];
} => {
  const searchableFieldsByObjectUniversalIdentifier =
    fromArrayToValuesByKeyRecord({
      array: flatFieldMetadatasToCreate.filter((flatFieldMetadata) =>
        isSearchableFieldType(flatFieldMetadata.type),
      ),
      key: 'objectMetadataUniversalIdentifier',
    });

  const searchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[] = [];
  const flatSearchVectorFieldsToUpdate: FlatFieldMetadata<FieldMetadataType.TS_VECTOR>[] =
    [];

  for (const [
    objectMetadataUniversalIdentifier,
    newSearchableFields,
  ] of Object.entries(searchableFieldsByObjectUniversalIdentifier)) {
    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: objectMetadataUniversalIdentifier,
    });

    if (!isDefined(flatObjectMetadata) || !flatObjectMetadata.isSearchable) {
      continue;
    }

    for (const newSearchableField of newSearchableFields) {
      searchFieldMetadatasToCreate.push(
        buildFlatSearchFieldMetadataForField({
          flatObjectMetadata,
          flatFieldMetadata: newSearchableField,
        }),
      );
    }

    const objectFlatFieldMetadatas =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityIds: flatObjectMetadata.fieldIds,
      });

    const searchVectorField = findOrThrow(
      objectFlatFieldMetadatas,
      (field) => field.name === SEARCH_VECTOR_FIELD.name,
    ) as FlatFieldMetadata<FieldMetadataType.TS_VECTOR>;

    const existingSearchFieldMetadatas =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow<FlatSearchFieldMetadata>({
        flatEntityMaps: flatSearchFieldMetadataMaps,
        flatEntityIds: flatObjectMetadata.searchFieldMetadataIds,
      });

    const existingTargetFields = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: existingSearchFieldMetadatas.map(
        (searchFieldMetadata) => searchFieldMetadata.fieldMetadataId,
      ),
    }).map((flatFieldMetadata) =>
      buildSearchVectorTargetField(flatFieldMetadata, flatFieldMetadata.id),
    );

    // Field not persisted yet, no id: use universalIdentifier as tie-break.
    const newTargetFields = newSearchableFields.map((newSearchableField) =>
      buildSearchVectorTargetField(
        newSearchableField,
        newSearchableField.universalIdentifier,
      ),
    );

    const newAsExpression =
      computeSearchVectorAsExpressionFromSearchFieldMetadatas([
        ...existingTargetFields,
        ...newTargetFields,
      ]);

    flatSearchVectorFieldsToUpdate.push({
      ...searchVectorField,
      universalSettings: {
        ...searchVectorField.universalSettings,
        asExpression: newAsExpression,
        generatedType: 'STORED',
      },
    });
  }

  return {
    searchFieldMetadatasToCreate,
    flatSearchVectorFieldsToUpdate,
  };
};
