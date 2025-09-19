import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';
import { findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-with-flat-field-maps-in-flat-object-metadata-maps-or-throw.util';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';

type FromDeleteFieldInputToFlatFieldMetadatasToDeleteArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  existingFlatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  deleteOneFieldInput: DeleteOneFieldInput;
};
// TODO refactor as a side effect service
export const fromDeleteFieldInputToFlatFieldMetadatasToDelete = ({
  existingFlatObjectMetadataMaps,
  deleteOneFieldInput: rawDeleteOneInput,
  existingFlatIndexMaps,
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

  const flatFieldMetadataToDelete =
    findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId({
      fieldMetadataId: fieldMetadataToDeleteId,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

  if (!isDefined(flatFieldMetadataToDelete)) {
    throw new FieldMetadataException(
      'Field to delete not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const relatedFlatFieldMetadataToDelete =
    computeFlatFieldMetadataRelatedFlatFieldMetadata({
      flatFieldMetadata: flatFieldMetadataToDelete,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
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
              flatIndexField.fieldMetadataId === flatFieldMetadata.id,
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
          flatIndexField.fieldMetadataId === flatFieldMetadata.id,
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

      const flatObjectMetadata =
        findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow({
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          objectMetadataId: flatIndex.objectMetadataId,
        });
      const newIndexName = generateDeterministicIndexNameV2({
        flatFieldMetadatas: flatObjectMetadata.flatFieldMetadatas.filter(
          (flatFieldMetadata) =>
            flatIndex.flatIndexFieldMetadatas.some(
              (flatIndexField) =>
                flatIndexField.fieldMetadataId === flatFieldMetadata.id,
            ),
        ),
        flatObjectMetadata,
        isUnique: flatIndex.isUnique,
      });

      return {
        ...acc,
        flatIndexesToUpdate: [
          ...acc.flatIndexesToUpdate,
          {
            ...flatIndex,
            name: newIndexName,
          },
        ],
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
