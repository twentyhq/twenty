import { BadRequestException } from '@nestjs/common';

import { FieldMetadataDefaultSerializableValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

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
    switch (defaultValue.type) {
      case 'uuid':
        return 'public.uuid_generate_v4()';
      case 'now':
        return 'now()';
      default:
        throw new BadRequestException('Invalid dynamic default value type');
    }
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
