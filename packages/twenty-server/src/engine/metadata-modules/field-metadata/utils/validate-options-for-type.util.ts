import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

import { isEnumFieldMetadataType } from './is-enum-field-metadata-type.util';

export const optionsValidatorsMap = {
  // RATING doesn't need to be provided as it's the backend that will generate the options
  [FieldMetadataType.SELECT]: [FieldMetadataComplexOption],
  [FieldMetadataType.MULTI_SELECT]: [FieldMetadataComplexOption],
};

export const validateOptionsForType = (
  type: FieldMetadataType,
  options: FieldMetadataOptions,
): boolean => {
  if (options === null) return true;

  if (!Array.isArray(options)) {
    throw new FieldMetadataException(
      'Options must be an array',
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }

  if (!isEnumFieldMetadataType(type)) {
    return true;
  }

  if (type === FieldMetadataType.RATING) {
    return true;
  }

  const values = options.map(({ value }) => value);

  // Check if all options are unique
  if (new Set(values).size !== options.length) {
    throw new FieldMetadataException(
      'Options must be unique',
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }

  const validators = optionsValidatorsMap[type];

  if (!validators) return false;

  const isValid = options.every((option) => {
    return validators.some((validator) => {
      const optionsInstance = plainToInstance<
        any,
        FieldMetadataDefaultOption | FieldMetadataComplexOption
      >(validator, option);

      return (
        validateSync(optionsInstance, {
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
        }).length === 0
      );
    });
  });

  return isValid;
};
