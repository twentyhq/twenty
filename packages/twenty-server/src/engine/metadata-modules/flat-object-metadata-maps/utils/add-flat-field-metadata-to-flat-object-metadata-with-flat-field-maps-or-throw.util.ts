import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import {
  FlatFieldMetadataMaps,
  FlatObjectMetadataWithFlatFieldMaps,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';

type AddFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMapsOrThrowArgs = {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataWithFlatFieldMaps: FlatObjectMetadataWithFlatFieldMaps;
};
export const addFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMapsOrThrow =
  ({
    flatFieldMetadata,
    flatObjectMetadataWithFlatFieldMaps,
  }: AddFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMapsOrThrowArgs): FlatObjectMetadataWithFlatFieldMaps => {
    if (
      isDefined(
        flatObjectMetadataWithFlatFieldMaps.fieldsById[flatFieldMetadata.id],
      )
    ) {
      throw new FlatObjectMetadataMapsException(
        'addFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMaps added flatFieldMetadata already exists',
        FlatObjectMetadataMapsExceptionCode.FIELD_METADATA_ALREADY_EXISTS,
      );
    }

    let updatedFieldIdByJoinColumnName:
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
        updatedFieldIdByJoinColumnName = {
          [flatFieldMetadata.settings.joinColumnName]: flatFieldMetadata.id,
        };
      }
    }

    return {
      ...flatObjectMetadataWithFlatFieldMaps,
      fieldIdByJoinColumnName: {
        ...flatObjectMetadataWithFlatFieldMaps.fieldIdByJoinColumnName,
        ...updatedFieldIdByJoinColumnName,
      },
      fieldIdByName: {
        ...flatObjectMetadataWithFlatFieldMaps.fieldIdByName,
        [flatFieldMetadata.name]: flatFieldMetadata.id,
      },
      fieldsById: {
        ...flatObjectMetadataWithFlatFieldMaps.fieldsById,
        [flatFieldMetadata.id]: flatFieldMetadata,
      },
    };
  };
