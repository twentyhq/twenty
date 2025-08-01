import { mergeTwoFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-two-flat-field-metadatas.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FlatObjectAndFlatFieldsToCreate } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-field-and-flat-object-metadata-array-to-flat-object-and-flat-fields-to-create.util';

export const optimisticallyApplyFlatFieldMetadatasToCreateToFlatObjectMetadata =
  (
    flatObjectAndFlatFieldsToCreate: FlatObjectAndFlatFieldsToCreate[],
  ): FlatObjectMetadata[] => {
    return flatObjectAndFlatFieldsToCreate.map(
      ({ flatObjectMetadata, toCreateFlatFieldMetadata }) => {
        return {
          ...flatObjectMetadata,
          flatFieldMetadatas: mergeTwoFlatFieldMetadatas({
            destFlatFieldMetadatas: flatObjectMetadata.flatFieldMetadatas,
            toMergeFlatFieldMetadatas: toCreateFlatFieldMetadata,
          }),
        };
      },
    );
  };
