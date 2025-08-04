import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';

type DeleteObjectFromFlatObjectMetadataMapsArgs = {
  fieldMetadataId: string;
  flatObjectMetadataWithFlatFieldMaps: FlatObjectMetadataWithFlatFieldMaps;
};
export const deleteFieldFromFlatObjectMetadataWithFlatFieldMaps = ({
  flatObjectMetadataWithFlatFieldMaps,
  fieldMetadataId: fieldMetadataIdToRemove,
}: DeleteObjectFromFlatObjectMetadataMapsArgs): FlatObjectMetadataWithFlatFieldMaps => {
  const flatFieldMetadataToRemove =
    flatObjectMetadataWithFlatFieldMaps.fieldsById[fieldMetadataIdToRemove];

  if (!isDefined(flatFieldMetadataToRemove)) {
    throw new Error('TODO'); // Create specific exception
  }

  const {
    fieldIdByName,
    fieldsById,
    flatFieldMetadatas,
    fieldIdByJoinColumnName,
  } = flatObjectMetadataWithFlatFieldMaps;
  const updatedFieldIdByJoinColumnName = Object.entries(
    fieldIdByJoinColumnName,
  ).filter(([fieldId]) => fieldId !== fieldMetadataIdToRemove);

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
