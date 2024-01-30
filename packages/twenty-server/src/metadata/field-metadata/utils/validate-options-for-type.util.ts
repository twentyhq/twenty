import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { FieldMetadataOptions } from 'src/metadata/field-metadata/interfaces/field-metadata-options.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/metadata/field-metadata/dtos/options.input';

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
    return false;
  }

  if (!isEnumFieldMetadataType(type)) {
    return true;
  }

  if (type === FieldMetadataType.RATING) {
    return true;
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
