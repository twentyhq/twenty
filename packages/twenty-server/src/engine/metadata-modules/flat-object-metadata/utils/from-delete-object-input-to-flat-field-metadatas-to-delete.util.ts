import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-relation-flat-field-metadatas-or-throw.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

export const fromDeleteObjectInputToFlatFieldMetadatasToDelete = ({
  deleteObjectInput: rawDeleteObjectInput,
  existingFlatObjectMetadataMaps,
}: {
  deleteObjectInput: DeleteOneObjectInput;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
}): {
  flatFieldMetadatasToDelete: FlatFieldMetadata[];
  objectMetadataToDeleteId: string;
} => {
  const { id: objectMetadataToDeleteId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawDeleteObjectInput,
      ['id'],
    );

  const flatObjectMetadataToDelete =
    findFlatObjectMetadataInFlatObjectMetadataMaps({
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      objectMetadataId: objectMetadataToDeleteId,
    });

  if (!isDefined(flatObjectMetadataToDelete)) {
    throw new ObjectMetadataException(
      'Object to delete not found',
      ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  const flatFieldMetadatasToDelete =
    flatObjectMetadataToDelete.flatFieldMetadatas.flatMap(
      (flatFieldMetadata) => {
        if (
          isFlatFieldMetadataEntityOfType(
            flatFieldMetadata,
            FieldMetadataType.RELATION,
          ) ||
          isFlatFieldMetadataEntityOfType(
            flatFieldMetadata,
            FieldMetadataType.MORPH_RELATION,
          )
        ) {
          return getRelationFlatFieldMetadatasOrThrow({
            existingFlatObjectMetadataMaps,
            flatFieldMetadata,
          });
        }

        return flatFieldMetadata;
      },
    );

  return {
    flatFieldMetadatasToDelete,
    objectMetadataToDeleteId,
  };
};
