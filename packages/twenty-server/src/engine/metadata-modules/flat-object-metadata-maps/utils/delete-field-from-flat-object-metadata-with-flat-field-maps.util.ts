import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';

type DeleteFieldFromFlatObjectMetadataMapsArgs = {
  fieldMetadataId: string;
  flatObjectMetadataWithFlatFieldMaps: FlatObjectMetadataWithFlatFieldMaps;
};
export const deleteFieldFromFlatObjectMetadataWithFlatFieldMaps = ({
  flatObjectMetadataWithFlatFieldMaps,
  fieldMetadataId: fieldMetadataIdToRemove,
}: DeleteFieldFromFlatObjectMetadataMapsArgs): FlatObjectMetadataWithFlatFieldMaps => {
  const flatFieldMetadataToRemove =
    flatObjectMetadataWithFlatFieldMaps.fieldsById[fieldMetadataIdToRemove];

  if (!isDefined(flatFieldMetadataToRemove)) {
    return flatObjectMetadataWithFlatFieldMaps;
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
