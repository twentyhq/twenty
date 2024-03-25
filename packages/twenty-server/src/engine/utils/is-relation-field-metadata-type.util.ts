import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const isRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.RELATION => {
  return type === FieldMetadataType.RELATION;
};
