import { FieldMetadataType } from 'twenty-shared/types';
export const isRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.RELATION => {
  return type === FieldMetadataType.RELATION;
};
