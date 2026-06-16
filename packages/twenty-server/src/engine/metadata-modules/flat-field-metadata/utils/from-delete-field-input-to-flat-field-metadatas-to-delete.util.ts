import { type FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { recomputeSearchVectorFieldFromSearchFieldMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-search-vector-field-from-search-field-metadatas.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

type FromDeleteFieldInputToFlatFieldMetadatasToDeleteArgs = {
  deleteOneFieldInput: DeleteOneFieldInput;
} & Pick<
  AllFlatEntityMaps,
  | 'flatFieldMetadataMaps'
  | 'flatIndexMaps'
  | 'flatObjectMetadataMaps'
  | 'flatSearchFieldMetadataMaps'
>;
// TODO refactor as a side effect service
export const fromDeleteFieldInputToFlatFieldMetadatasToDelete = ({
  flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
  deleteOneFieldInput: rawDeleteOneInput,
  flatIndexMaps: existingFlatIndexMaps,
  flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
  flatSearchFieldMetadataMaps: existingFlatSearchFieldMetadataMaps,
}: FromDeleteFieldInputToFlatFieldMetadatasToDeleteArgs): {
  flatFieldMetadatasToDelete: UniversalFlatFieldMetadata[];
  flatIndexesToUpdate: UniversalFlatIndexMetadata[];
  flatIndexesToDelete: UniversalFlatIndexMetadata[];
  searchFieldMetadatasToDelete: UniversalFlatSearchFieldMetadata[];
  flatSearchVectorFieldsToUpdate: FlatFieldMetadata<FieldMetadataType.TS_VECTOR>[];
} => {
  const { id: fieldMetadataToDeleteId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawDeleteOneInput,
      ['id'],
    );

  const flatFieldMetadataToDelete = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataToDeleteId,
    flatEntityMaps: existingFlatFieldMetadataMaps,
  });

  if (!isDefined(flatFieldMetadataToDelete)) {
    throw new FieldMetadataException(
      'Field to delete not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  if (
    belongsToTwentyStandardApp(flatFieldMetadataToDelete) ||
    flatFieldMetadataToDelete.isSystem
  ) {
    throw new FieldMetadataException(
      `Cannot delete standard field "${flatFieldMetadataToDelete.name}"`,
      FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
    );
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: flatFieldMetadataToDelete.objectMetadataId,
    flatEntityMaps: existingFlatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    throw new FieldMetadataException(
      'Field to delete object metadata not found',
      FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  const relatedFlatFieldMetadataToDelete =
    computeFlatFieldMetadataRelatedFlatFieldMetadata({
      flatFieldMetadata: flatFieldMetadataToDelete,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatObjectMetadata,
    });

  const flatFieldMetadatasToDelete = [
    flatFieldMetadataToDelete,
    ...relatedFlatFieldMetadataToDelete,
  ];

  const flatIndexMap = new Map<string, FlatIndexMetadata>();
  const allFlatIndexes = Object.values(
    existingFlatIndexMaps.byUniversalIdentifier,
  ).filter(isDefined);

  for (const flatFieldMetadata of flatFieldMetadatasToDelete) {
    allFlatIndexes.forEach((flatIndex) => {
      const flatIndexFromMap = flatIndexMap.get(flatIndex.id);

      if (isDefined(flatIndexFromMap)) {
        const updatedFlatIndexFields =
          flatIndexFromMap.flatIndexFieldMetadatas.filter(
            (flatIndexField) =>
              flatIndexField.fieldMetadataId !== flatFieldMetadata.id,
          );

        flatIndexMap.set(flatIndexFromMap.id, {
          ...flatIndexFromMap,
          flatIndexFieldMetadatas: updatedFlatIndexFields,
        });

        return;
      }

      if (
        flatIndex.objectMetadataId !== flatFieldMetadata.objectMetadataId ||
        !flatIndex.flatIndexFieldMetadatas.some(
          (flatIndexField) =>
            flatIndexField.fieldMetadataId === flatFieldMetadata.id,
        )
      ) {
        return;
      }

      const updatedFlatIndexFields = flatIndex.flatIndexFieldMetadatas.filter(
        (flatIndexField) =>
          flatIndexField.fieldMetadataId !== flatFieldMetadata.id,
      );

      flatIndexMap.set(flatIndex.id, {
        ...flatIndex,
        flatIndexFieldMetadatas: updatedFlatIndexFields,
      });
    });
  }

  const { flatIndexesToDelete, flatIndexesToUpdate } = [
    ...flatIndexMap.values(),
  ].reduce<{
    flatIndexesToUpdate: UniversalFlatIndexMetadata[];
    flatIndexesToDelete: UniversalFlatIndexMetadata[];
  }>(
    (acc, flatIndex) => {
      if (flatIndex.flatIndexFieldMetadatas.length === 0) {
        return {
          ...acc,
          flatIndexesToDelete: [...acc.flatIndexesToDelete, flatIndex],
        };
      }

      const flatObjectMetadata = findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: existingFlatObjectMetadataMaps,
        universalIdentifier: flatIndex.objectMetadataUniversalIdentifier,
      });
      const objectFlatFieldMetadatas =
        findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow(
          {
            flatEntityMaps: existingFlatFieldMetadataMaps,
            universalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
          },
        );

      const newIndex = generateFlatIndexMetadataWithNameOrThrow({
        flatObjectMetadata,
        flatIndex,
        objectFlatFieldMetadatas,
      });

      return {
        ...acc,
        flatIndexesToUpdate: [...acc.flatIndexesToUpdate, newIndex],
      };
    },
    {
      flatIndexesToDelete: [],
      flatIndexesToUpdate: [],
    },
  );

  const { searchFieldMetadatasToDelete, flatSearchVectorFieldsToUpdate } =
    computeSearchFieldMetadataDeletionForDeletedFields({
      flatFieldMetadatasToDelete,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatSearchFieldMetadataMaps: existingFlatSearchFieldMetadataMaps,
    });

  return {
    flatFieldMetadatasToDelete,
    flatIndexesToDelete,
    flatIndexesToUpdate,
    searchFieldMetadatasToDelete,
    flatSearchVectorFieldsToUpdate,
  };
};

// Mirrors index removal on field delete: drop each searchFieldMetadata row that
// references a deleted field and recompute the affected objects' searchVector
// without those fields.
const computeSearchFieldMetadataDeletionForDeletedFields = ({
  flatFieldMetadatasToDelete,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
}: {
  flatFieldMetadatasToDelete: FlatFieldMetadata[];
} & Pick<
  AllFlatEntityMaps,
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatSearchFieldMetadataMaps'
>): {
  searchFieldMetadatasToDelete: UniversalFlatSearchFieldMetadata[];
  flatSearchVectorFieldsToUpdate: FlatFieldMetadata<FieldMetadataType.TS_VECTOR>[];
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
  const flatSearchVectorFieldsToUpdate: FlatFieldMetadata<FieldMetadataType.TS_VECTOR>[] =
    [];

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

    if (rowsToDelete.length === 0) {
      continue;
    }

    searchFieldMetadatasToDelete.push(...rowsToDelete);

    const remainingFieldIds = objectSearchFieldMetadatas
      .filter(
        (searchFieldMetadata) =>
          !deletedFieldIds.has(searchFieldMetadata.fieldMetadataId),
      )
      .map((searchFieldMetadata) => searchFieldMetadata.fieldMetadataId);

    const flatSearchVectorFieldToUpdate =
      recomputeSearchVectorFieldFromSearchFieldMetadatas({
        flatObjectMetadata,
        flatFieldMetadataMaps,
        searchFieldMetadataFieldIds: remainingFieldIds,
      });

    if (isDefined(flatSearchVectorFieldToUpdate)) {
      flatSearchVectorFieldsToUpdate.push(flatSearchVectorFieldToUpdate);
    }
  }

  return {
    searchFieldMetadatasToDelete,
    flatSearchVectorFieldsToUpdate,
  };
};
