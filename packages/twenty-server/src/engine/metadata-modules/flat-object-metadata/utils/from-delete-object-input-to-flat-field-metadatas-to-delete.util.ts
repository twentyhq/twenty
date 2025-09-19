import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

type FromDeleteObjectInputToFlatFieldMetadatasToDeleteArgs = {
  deleteObjectInput: DeleteOneObjectInput;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  existingFlatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
};
export const fromDeleteObjectInputToFlatFieldMetadatasToDelete = ({
  deleteObjectInput: rawDeleteObjectInput,
  existingFlatObjectMetadataMaps,
  existingFlatIndexMaps,
  // This should return an AllFlatEntityMaps
}: FromDeleteObjectInputToFlatFieldMetadatasToDeleteArgs): {
  flatFieldMetadatasToDelete: FlatFieldMetadata[];
  flatObjectMetadataToDelete: FlatObjectMetadata;
  flatIndexToDelete: FlatIndexMetadata[];
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

  // Should we compute any index update here too ? TODO prastoin
  const flatFieldMetadatasToDelete =
    flatObjectMetadataToDelete.flatFieldMetadatas.flatMap(
      (flatFieldMetadata) => {
        if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
          const relationTargetFlatFieldMetadata =
            findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
              flatFieldMetadata,
              flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
            });

          return [flatFieldMetadata, relationTargetFlatFieldMetadata];
        }

        return [flatFieldMetadata];
      },
    );

  // We should maintain a idsByObjectMetadataId maps in the index
  // Too costy here
  const flatIndexMetadataToDelete = Object.values(
    existingFlatIndexMaps.byId,
  ).filter(
    (flatIndex): flatIndex is FlatIndexMetadata =>
      isDefined(flatIndex) &&
      flatIndex.objectMetadataId === flatObjectMetadataToDelete.id,
  );

  return {
    flatFieldMetadatasToDelete,
    flatObjectMetadataToDelete,
    flatIndexToDelete: flatIndexMetadataToDelete,
  };
};
