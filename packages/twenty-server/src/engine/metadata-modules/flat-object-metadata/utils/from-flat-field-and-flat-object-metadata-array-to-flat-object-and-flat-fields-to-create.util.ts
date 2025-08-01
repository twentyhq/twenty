import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatFieldAndFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-and-its-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FlatObjectAndFlatFieldsToCreate = {
  flatObjectMetadata: FlatObjectMetadata;
  toCreateFlatFieldMetadata: FlatFieldMetadata[];
};
export const fromFlatFieldAndFlatObjectMetadataArrayToFlatObjectAndFlatFieldsToCreate =
  (
    flatFieldAndFLatObjectArray: FlatFieldAndFlatObjectMetadata[],
  ): FlatObjectAndFlatFieldsToCreate[] => {
    const record = flatFieldAndFLatObjectArray.reduce<
      Record<string, FlatObjectAndFlatFieldsToCreate>
    >((acc, { flatFieldMetadata, parentFlatObjectMetadata }) => {
      const occurrence = acc[parentFlatObjectMetadata.id];

      if (occurrence) {
        return {
          ...acc,
          [parentFlatObjectMetadata.id]: {
            ...occurrence,
            toCreateFlatFieldMetadata: [
              ...occurrence.toCreateFlatFieldMetadata,
              flatFieldMetadata,
            ],
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
    }, {});

    return Object.values(record);
  };
