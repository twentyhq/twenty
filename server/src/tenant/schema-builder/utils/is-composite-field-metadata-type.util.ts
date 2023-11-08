import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const isCompositeFieldMetadataType = (type: FieldMetadataType) => {
  return type === FieldMetadataType.RELATION;
};
