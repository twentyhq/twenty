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
    if (type === FieldMetadataType.DATE_TIME && defaultValue.type === 'now') {
      return true;
    }

    return false;
  }

  // Static default values
  switch (type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
    case FieldMetadataType.RATING:
    case FieldMetadataType.SELECT:
    case FieldMetadataType.NUMERIC:
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

    case FieldMetadataType.DATE_TIME:
      return (
        typeof defaultValue === 'object' &&
        'value' in defaultValue &&
        defaultValue.value instanceof Date
      );

    case FieldMetadataType.LINK:
      return (
        typeof defaultValue === 'object' &&
        'label' in defaultValue &&
        typeof defaultValue.label === 'string' &&
        'url' in defaultValue &&
        typeof defaultValue.url === 'string'
      );

    case FieldMetadataType.CURRENCY:
      return (
        typeof defaultValue === 'object' &&
        'amountMicros' in defaultValue &&
        typeof defaultValue.amountMicros === 'number' &&
        'currencyCode' in defaultValue &&
        typeof defaultValue.currencyCode === 'string'
      );

    case FieldMetadataType.FULL_NAME:
      return (
        typeof defaultValue === 'object' &&
        'firstName' in defaultValue &&
        typeof defaultValue.firstName === 'string' &&
        'lastName' in defaultValue &&
        typeof defaultValue.lastName === 'string'
      );

    case FieldMetadataType.MULTI_SELECT:
      return (
        Array.isArray(defaultValue) &&
        defaultValue.every((value) => typeof value === 'string')
      );

    default:
      return false;
  }
};
