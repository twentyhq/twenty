import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const fromDeleteObjectInputToFlatFieldMetadatasToDelete = ({
  deleteObjectInput: rawDeleteObjectInput,
  existingFlatObjectMetadataMaps,
}: {
  deleteObjectInput: DeleteOneObjectInput;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
}): {
  flatFieldMetadatasToDelete: FlatFieldMetadata[];
  flatObjectMetadataToDelete: FlatObjectMetadata;
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
        const relatedFlatFieldMetadata =
          computeFlatFieldMetadataRelatedFlatFieldMetadata({
            flatFieldMetadata,
            flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          });

        return [flatFieldMetadata, ...relatedFlatFieldMetadata];
      },
    );

  return {
    flatFieldMetadatasToDelete,
    flatObjectMetadataToDelete,
  };
};
