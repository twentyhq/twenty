import { FieldMetadataType } from 'twenty-shared/types';
export const isRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.RELATION => {
  return type === FieldMetadataType.RELATION;
};

export const isMorphRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.MORPH_RELATION => {
  return type === FieldMetadataType.MORPH_RELATION;
};
