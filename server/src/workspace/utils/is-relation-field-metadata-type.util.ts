import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const isRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.RELATION => {
  return type === FieldMetadataType.RELATION;
};
