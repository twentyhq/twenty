import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatFieldAndFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-and-its-flat-object-metadata.util';
import { mergeTwoFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-two-flat-field-metadatas.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FlatObjectAndFlatFieldsToCreate = {
  flatObjectMetadata: FlatObjectMetadata;
  toCreateFlatFieldMetadata: FlatFieldMetadata[];
};

type FlatObjectAndFlatFieldsToCreateByFlatObjectId = Record<
  string,
  FlatObjectAndFlatFieldsToCreate
>;

export const fromFlatFieldAndFlatObjectMetadataArrayToFlatObjectAndFlatFieldsToCreate =
  (
    flatFieldAndFLatObjectArray: FlatFieldAndFlatObjectMetadata[],
  ): FlatObjectAndFlatFieldsToCreate[] => {
    const initialAccumulator: FlatObjectAndFlatFieldsToCreateByFlatObjectId =
      {};
    const flatObjectAndFlatFieldsToCreateByFlatObjectId =
      flatFieldAndFLatObjectArray.reduce(
        (acc, { flatFieldMetadata, parentFlatObjectMetadata }) => {
          const occurrence = acc[parentFlatObjectMetadata.id];

          if (occurrence) {
            return {
              ...acc,
              [parentFlatObjectMetadata.id]: {
                ...occurrence,
                toCreateFlatFieldMetadata: mergeTwoFlatFieldMetadatas({
                  destFlatFieldMetadatas: occurrence.toCreateFlatFieldMetadata,
                  toMergeFlatFieldMetadatas: [flatFieldMetadata],
                }),
              },
            };
          }

          return {
            ...acc,
            [parentFlatObjectMetadata.id]: {
              flatObjectMetadata: parentFlatObjectMetadata,
              toCreateFlatFieldMetadata: [flatFieldMetadata],
            },
          };
        },
        initialAccumulator,
      );

    return Object.values(flatObjectAndFlatFieldsToCreateByFlatObjectId);
  };
