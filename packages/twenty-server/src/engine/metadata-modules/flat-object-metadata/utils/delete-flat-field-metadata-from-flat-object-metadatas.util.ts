import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const deleteFlatFieldMetadataFromFlatObjectMetadatas = ({
  flatFieldMetadata: flatFieldMetadataToRemove,
  flatObjectMetadatas,
}: {
  flatObjectMetadatas: FlatObjectMetadata[];
  flatFieldMetadata: FlatFieldMetadata;
}) => {
  return flatObjectMetadatas.map((flatObjectMetadata) => {
    if (flatObjectMetadata.id !== flatFieldMetadataToRemove.objectMetadataId) {
      return flatObjectMetadata;
    }

    const flatFieldMetadatas = flatObjectMetadata.flatFieldMetadatas.filter(
      ({ id: flatFieldMetadataId }) =>
        flatFieldMetadataId !== flatFieldMetadataToRemove.id,
    );

    return {
      ...flatObjectMetadata,
      flatFieldMetadatas,
    };
  });
};
