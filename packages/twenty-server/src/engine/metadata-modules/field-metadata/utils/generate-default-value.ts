import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function generateDefaultValue(
  type: FieldMetadataType,
): FieldMetadataDefaultValue {
  switch (type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
      return {
        value: "''",
      };
    case FieldMetadataType.FULL_NAME:
      return {
        firstName: "''",
        lastName: "''",
      };
    case FieldMetadataType.LINK:
      return {
        url: "''",
        label: "''",
      };
    case FieldMetadataType.CURRENCY:
      return {
        amountMicros: null,
        currencyCode: "''",
      };
    default:
      return null;
  }
}
