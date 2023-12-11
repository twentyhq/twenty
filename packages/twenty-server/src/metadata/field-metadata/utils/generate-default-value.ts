import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export function generateDefaultValue(
  type: FieldMetadataType,
): FieldMetadataDefaultValue {
  switch (type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
      return {
        value: '',
      };
    case FieldMetadataType.FULL_NAME:
      return {
        firstName: '',
        lastName: '',
      };
    default:
      return null;
  }
}
