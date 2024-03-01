import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

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
