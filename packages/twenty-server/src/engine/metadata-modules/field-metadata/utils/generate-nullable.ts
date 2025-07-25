import { FieldMetadataType } from 'twenty-shared/types';
export function generateNullable(
  type: FieldMetadataType,
  inputNullableValue?: boolean,
  isRemoteCreation?: boolean,
): boolean {
  if (isRemoteCreation) {
    return true;
  }

  switch (type) {
    // Why ?
    case FieldMetadataType.TEXT:
      return false;
    default:
      return inputNullableValue ?? true;
  }
}
