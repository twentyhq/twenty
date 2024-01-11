import { BadRequestException } from '@nestjs/common';

import { FieldMetadataDefaultSerializableValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { serializeTypeDefaultValue } from 'src/metadata/field-metadata/utils/serialize-type-default-value.util';

export const serializeDefaultValue = (
  defaultValue?: FieldMetadataDefaultSerializableValue,
) => {
  if (defaultValue === undefined || defaultValue === null) {
    return null;
  }

  // Dynamic default values
  if (
    !Array.isArray(defaultValue) &&
    typeof defaultValue === 'object' &&
    'type' in defaultValue
  ) {
    const serializedTypeDefaultValue = serializeTypeDefaultValue(defaultValue);

    if (!serializedTypeDefaultValue) {
      throw new BadRequestException('Invalid default value');
    }

    return serializedTypeDefaultValue;
  }

  // Static default values
  if (typeof defaultValue === 'string') {
    return `'${defaultValue}'`;
  }

  if (typeof defaultValue === 'number') {
    return defaultValue;
  }

  if (typeof defaultValue === 'boolean') {
    return defaultValue;
  }

  if (defaultValue instanceof Date) {
    return `'${defaultValue.toISOString()}'`;
  }

  if (Array.isArray(defaultValue)) {
    return defaultValue;
  }

  if (typeof defaultValue === 'object') {
    return `'${JSON.stringify(defaultValue)}'`;
  }

  throw new BadRequestException('Invalid default value');
};
