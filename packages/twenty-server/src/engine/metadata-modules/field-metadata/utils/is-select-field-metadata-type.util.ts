import { FieldMetadataType } from 'twenty-shared/types';
export const isSelectFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.SELECT => {
  return type === FieldMetadataType.SELECT;
};
