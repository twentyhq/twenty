import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  FlatFieldMetadataMaps,
  FlatObjectMetadataWithFlatFieldMaps,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const fromFlatObjectMetadataToFlatObjectMetadataWithFlatFieldMaps = (
  flatObjectMetadata: FlatObjectMetadata,
): FlatObjectMetadataWithFlatFieldMaps => {
  const fields = flatObjectMetadata.flatFieldMetadatas;

  const initialAccumulator: FlatFieldMetadataMaps = {
    fieldIdByJoinColumnName: {},
    fieldIdByName: {},
    fieldsById: {},
  };
  const { fieldsById, fieldIdByName, fieldIdByJoinColumnName } = fields.reduce(
    (acc, flatFieldMetadata) => {
      let udpatedFieldIdByJoinColumnName:
        | FlatFieldMetadataMaps['fieldIdByJoinColumnName']
        | undefined = undefined;

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
        if (isDefined(flatFieldMetadata.settings?.joinColumnName)) {
          udpatedFieldIdByJoinColumnName = {
            [flatFieldMetadata.settings.joinColumnName]: flatFieldMetadata.id,
          };
        }
      }

      return {
        ...acc,
        fieldIdByJoinColumnName: {
          ...acc.fieldIdByJoinColumnName,
          ...udpatedFieldIdByJoinColumnName,
        },
        fieldIdByName: {
          ...acc.fieldIdByName,
          [flatFieldMetadata.name]: flatFieldMetadata.id,
        },
        fieldsById: {
          ...acc.fieldsById,
          [flatFieldMetadata.id]: flatFieldMetadata,
        },
      };
    },
    initialAccumulator,
  );

  return {
    ...flatObjectMetadata,
    fieldIdByJoinColumnName,
    fieldIdByName,
    fieldsById,
  };
};
