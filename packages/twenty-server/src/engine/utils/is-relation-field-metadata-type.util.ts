import { FieldMetadataType } from 'src/engine-metadata/field-metadata/field-metadata.entity';

export const isRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.RELATION => {
  return type === FieldMetadataType.RELATION;
};
