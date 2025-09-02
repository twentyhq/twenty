import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import {
  type FlatFieldMetadataMaps,
  type FlatObjectMetadataWithFlatFieldMaps,
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
     isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
    ) {
      if (isDefined(flatFieldMetadata.settings.joinColumnName)) {
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
      flatFieldMetadatas: [
        ...flatObjectMetadataWithFlatFieldMaps.flatFieldMetadatas,
        flatFieldMetadata,
      ],
    };
  };
