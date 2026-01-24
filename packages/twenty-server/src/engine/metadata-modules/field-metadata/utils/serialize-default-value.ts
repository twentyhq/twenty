import { type FieldMetadataDefaultValueForAnyType } from 'twenty-shared/types';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/is-function-default-value.util';
import { serializeFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-function-default-value.util';

export const serializeDefaultValue = (
  defaultValue?: FieldMetadataDefaultValueForAnyType,
) => {
  if (defaultValue === undefined || defaultValue === null) {
    return null;
  }

  // Function default values
  if (isFunctionDefaultValue(defaultValue)) {
    const serializedTypeDefaultValue =
      serializeFunctionDefaultValue(defaultValue);

    if (!serializedTypeDefaultValue) {
      throw new FieldMetadataException(
        'Invalid default value',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    return serializedTypeDefaultValue;
  }

  // Static default values
  if (typeof defaultValue === 'string' && defaultValue.startsWith("'")) {
    return defaultValue;
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
    return `'{${defaultValue
      .map((value) => value.replace(/'/g, ''))
      .join(',')}}'`;
  }

  if (typeof defaultValue === 'object') {
    return `'${JSON.stringify(defaultValue)}'`;
  }

  throw new FieldMetadataException(
    `Invalid default value "${defaultValue}"`,
    FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
  );
};
