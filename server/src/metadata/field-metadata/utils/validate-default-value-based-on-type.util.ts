import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const validateDefaultValueBasedOnType = (
  defaultValue: FieldMetadataDefaultValue,
  type: FieldMetadataType,
): boolean => {
  if (defaultValue === null) return true;

  // Dynamic default values
  if (typeof defaultValue === 'object' && 'type' in defaultValue) {
    if (type === FieldMetadataType.UUID && defaultValue.type === 'uuid') {
      return true;
    }
    if (type === FieldMetadataType.DATE && defaultValue.type === 'now') {
      return true;
    }

    return false;
  }

  // Static default values
  switch (type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
    case FieldMetadataType.ENUM:
      return (
        typeof defaultValue === 'object' &&
        'value' in defaultValue &&
        typeof defaultValue.value === 'string'
      );

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.PROBABILITY:
      return (
        typeof defaultValue === 'object' &&
        'value' in defaultValue &&
        typeof defaultValue.value === 'number'
      );

    case FieldMetadataType.BOOLEAN:
      return (
        typeof defaultValue === 'object' &&
        'value' in defaultValue &&
        typeof defaultValue.value === 'boolean'
      );

    case FieldMetadataType.DATE:
      return (
        typeof defaultValue === 'object' &&
        'value' in defaultValue &&
        defaultValue.value instanceof Date
      );

    case FieldMetadataType.URL:
      return (
        typeof defaultValue === 'object' &&
        'text' in defaultValue &&
        typeof defaultValue.text === 'string' &&
        'link' in defaultValue &&
        typeof defaultValue.link === 'string'
      );

    case FieldMetadataType.MONEY:
      return (
        typeof defaultValue === 'object' &&
        'amount' in defaultValue &&
        typeof defaultValue.amount === 'number' &&
        'currency' in defaultValue &&
        typeof defaultValue.currency === 'string'
      );

    default:
      return false;
  }
};
