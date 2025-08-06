import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { mergeTwoFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-two-flat-field-metadatas.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const mergeFlatFieldMetadatasInFlatObjectMetadata = ({
  flatFieldMetadatas,
  flatObjectMetadata,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadatas: FlatFieldMetadata[];
}) => {
  return {
    ...flatObjectMetadata,
    flatFieldMetadatas: mergeTwoFlatFieldMetadatas({
      destFlatFieldMetadatas: flatObjectMetadata.flatFieldMetadatas,
      toMergeFlatFieldMetadatas: flatFieldMetadatas,
    }),
  };
};
