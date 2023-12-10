import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { FieldMetadataOptions } from 'src/metadata/field-metadata/interfaces/field-metadata-options.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  FieldMetadataComplexOptions,
  FieldMetadataDefaultOptions,
} from 'src/metadata/field-metadata/dtos/options.input';

export const optionsValidatorsMap = {
  [FieldMetadataType.RATING]: [FieldMetadataDefaultOptions],
  [FieldMetadataType.SELECT]: [FieldMetadataComplexOptions],
  [FieldMetadataType.MULTI_SELECT]: [FieldMetadataComplexOptions],
};

export const validateOptionsForType = (
  type: FieldMetadataType,
  options: FieldMetadataOptions,
): boolean => {
  if (options === null) return true;

  if (!Array.isArray(options)) {
    return false;
  }

  const validators = optionsValidatorsMap[type];

  if (!validators) return false;

  const isValid = options.every((option) => {
    return validators.some((validator) => {
      const optionsInstance = plainToInstance<
        any,
        FieldMetadataDefaultOptions | FieldMetadataComplexOptions
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
