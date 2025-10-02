import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findObjectFieldsInFlatFieldMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-object-fields-in-flat-field-metadata-maps.util';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

type FromDeleteObjectInputToFlatFieldMetadatasToDeleteArgs = {
  deleteObjectInput: DeleteOneObjectInput;
} & Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatObjectMetadataMaps' | 'flatIndexMaps'
>;
export const fromDeleteObjectInputToFlatFieldMetadatasToDelete = ({
  deleteObjectInput: rawDeleteObjectInput,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatIndexMaps,
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

  const flatObjectMetadataToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: objectMetadataToDeleteId,
  });

  if (!isDefined(flatObjectMetadataToDelete)) {
    throw new ObjectMetadataException(
      'Object to delete not found',
      ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  const { objectFlatFieldMetadatas } =
    findObjectFieldsInFlatFieldMetadataMapsOrThrow({
      flatFieldMetadataMaps,
      flatObjectMetadata: flatObjectMetadataToDelete,
    });
  const flatFieldMetadatasToDelete = objectFlatFieldMetadatas.flatMap(
    (flatFieldMetadata) => {
      if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
        const relationTargetFlatFieldMetadata =
          findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
            flatFieldMetadata,
            flatFieldMetadataMaps,
          });

        return [flatFieldMetadata, relationTargetFlatFieldMetadata];
      }

      return [flatFieldMetadata];
    },
  );

  // TODO We should maintain a idsByObjectMetadataId in the flatIndexMaps
  const flatIndexMetadataToDelete = Object.values(flatIndexMaps.byId).filter(
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
