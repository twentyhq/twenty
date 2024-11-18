import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const isSelectFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.SELECT => {
  return type === FieldMetadataType.SELECT;
};
