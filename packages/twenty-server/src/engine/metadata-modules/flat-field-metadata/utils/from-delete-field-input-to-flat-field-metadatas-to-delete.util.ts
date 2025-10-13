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
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';

type FromDeleteFieldInputToFlatFieldMetadatasToDeleteArgs = {
  deleteOneFieldInput: DeleteOneFieldInput;
} & Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatIndexMaps' | 'flatObjectMetadataMaps'
>;
// TODO refactor as a side effect service
export const fromDeleteFieldInputToFlatFieldMetadatasToDelete = ({
  flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
  deleteOneFieldInput: rawDeleteOneInput,
  flatIndexMaps: existingFlatIndexMaps,
  flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
}: FromDeleteFieldInputToFlatFieldMetadatasToDeleteArgs): {
  flatFieldMetadatasToDelete: FlatFieldMetadata[];
  flatIndexesToUpdate: FlatIndexMetadata[];
  flatIndexesToDelete: FlatIndexMetadata[];
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
  const allFlatIndexes = Object.values(existingFlatIndexMaps.byId).filter(
    isDefined,
  );

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
    flatIndexesToUpdate: FlatIndexMetadata[];
    flatIndexesToDelete: FlatIndexMetadata[];
  }>(
    (acc, flatIndex) => {
      if (flatIndex.flatIndexFieldMetadatas.length === 0) {
        return {
          ...acc,
          flatIndexesToDelete: [...acc.flatIndexesToDelete, flatIndex],
        };
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: existingFlatObjectMetadataMaps,
        flatEntityId: flatIndex.objectMetadataId,
      });
      const objectFlatFieldMetadatas =
        findManyFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: existingFlatFieldMetadataMaps,
          flatEntityIds: flatObjectMetadata.fieldMetadataIds,
        });

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

  return {
    flatFieldMetadatasToDelete,
    flatIndexesToDelete,
    flatIndexesToUpdate,
  };
};
