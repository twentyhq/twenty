import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  FieldMetadataDefaultValueBoolean,
  FieldMetadataDefaultValueCurrency,
  FieldMetadataDefaultValueDateTime,
  FieldMetadataDefaultValueFullName,
  FieldMetadataDefaultValueLink,
  FieldMetadataDefaultValueNumber,
  FieldMetadataDefaultValueString,
  FieldMetadataDefaultValueStringArray,
  FieldMetadataDynamicDefaultValueNow,
  FieldMetadataDynamicDefaultValueUuid,
} from 'src/metadata/field-metadata/dtos/default-value.input';

export const defaultValueValidatorsMap = {
  [FieldMetadataType.UUID]: [
    FieldMetadataDefaultValueString,
    FieldMetadataDynamicDefaultValueUuid,
  ],
  [FieldMetadataType.TEXT]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.PHONE]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.EMAIL]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.DATE_TIME]: [
    FieldMetadataDefaultValueDateTime,
    FieldMetadataDynamicDefaultValueNow,
  ],
  [FieldMetadataType.BOOLEAN]: [FieldMetadataDefaultValueBoolean],
  [FieldMetadataType.NUMBER]: [FieldMetadataDefaultValueNumber],
  [FieldMetadataType.NUMERIC]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.PROBABILITY]: [FieldMetadataDefaultValueNumber],
  [FieldMetadataType.LINK]: [FieldMetadataDefaultValueLink],
  [FieldMetadataType.CURRENCY]: [FieldMetadataDefaultValueCurrency],
  [FieldMetadataType.FULL_NAME]: [FieldMetadataDefaultValueFullName],
  [FieldMetadataType.RATING]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.SELECT]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.MULTI_SELECT]: [FieldMetadataDefaultValueStringArray],
};

export const validateDefaultValueForType = (
  type: FieldMetadataType,
  defaultValue: FieldMetadataDefaultValue,
): boolean => {
  if (defaultValue === null) return true;

  const validators = defaultValueValidatorsMap[type];

  if (!validators) return false;

  const isValid = validators.some((validator) => {
    const defaultValueInstance = plainToInstance<
      any,
      FieldMetadataDefaultValue
    >(validator, defaultValue);

    return (
      validateSync(defaultValueInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      }).length === 0
    );
  });

  return isValid;
};
