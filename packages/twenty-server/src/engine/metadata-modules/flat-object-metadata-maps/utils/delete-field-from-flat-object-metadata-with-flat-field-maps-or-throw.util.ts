import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';

type DeleteFieldFromFlatObjectMetadataMapsOrThrowArgs = {
  fieldMetadataId: string;
  flatObjectMetadataWithFlatFieldMaps: FlatObjectMetadataWithFlatFieldMaps;
};
export const deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow = ({
  flatObjectMetadataWithFlatFieldMaps,
  fieldMetadataId: fieldMetadataIdToRemove,
}: DeleteFieldFromFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataWithFlatFieldMaps => {
  const flatFieldMetadataToRemove =
    flatObjectMetadataWithFlatFieldMaps.fieldsById[fieldMetadataIdToRemove];

  if (!isDefined(flatFieldMetadataToRemove)) {
    throw new FlatObjectMetadataMapsException(
      'deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow: field to delete not found',
      FlatObjectMetadataMapsExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const {
    fieldIdByName,
    fieldsById,
    flatFieldMetadatas,
    fieldIdByJoinColumnName,
  } = flatObjectMetadataWithFlatFieldMaps;
  const updatedFieldIdByJoinColumnName = Object.entries(
    fieldIdByJoinColumnName,
  ).filter(([_joinColumnName, fieldId]) => fieldId !== fieldMetadataIdToRemove);

  return {
    ...flatObjectMetadataWithFlatFieldMaps,
    fieldIdByJoinColumnName: Object.fromEntries(updatedFieldIdByJoinColumnName),
    fieldIdByName: removePropertiesFromRecord(fieldIdByName, [
      flatFieldMetadataToRemove.name,
    ]),
    fieldsById: removePropertiesFromRecord(fieldsById, [
      fieldMetadataIdToRemove,
    ]),
    flatFieldMetadatas: flatFieldMetadatas.filter(
      (flatFieldMetadata) => flatFieldMetadata.id !== fieldMetadataIdToRemove,
    ),
  };
};
