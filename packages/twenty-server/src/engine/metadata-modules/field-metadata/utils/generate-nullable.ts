import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function generateNullable(
  type: FieldMetadataType,
  inputNullableValue?: boolean,
): boolean {
  switch (type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
      return false;
    default:
      return inputNullableValue ?? true;
  }
}
