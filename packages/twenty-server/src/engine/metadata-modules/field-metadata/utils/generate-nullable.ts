import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function generateNullable(
  type: FieldMetadataType,
  inputNullableValue?: boolean,
  isRemoteCreation?: boolean,
): boolean {
  if (isRemoteCreation) {
    return true;
  }

  switch (type) {
    case FieldMetadataType.TEXT:
      return false;
    default:
      return inputNullableValue ?? true;
  }
}
