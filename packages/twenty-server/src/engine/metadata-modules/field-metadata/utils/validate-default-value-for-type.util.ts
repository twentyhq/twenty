import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import {
  FieldMetadataClassValidation,
  FieldMetadataDefaultValue,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataDefaultValueAddress,
  FieldMetadataDefaultValueBoolean,
  FieldMetadataDefaultValueCurrency,
  FieldMetadataDefaultValueDateTime,
  FieldMetadataDefaultValueFullName,
  FieldMetadataDefaultValueRawJson,
  FieldMetadataDefaultValueLink,
  FieldMetadataDefaultValueNumber,
  FieldMetadataDefaultValueString,
  FieldMetadataDefaultValueStringArray,
  FieldMetadataDefaultValueNowFunction,
  FieldMetadataDefaultValueUuidFunction,
} from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const defaultValueValidatorsMap = {
  [FieldMetadataType.UUID]: [
    FieldMetadataDefaultValueString,
    FieldMetadataDefaultValueUuidFunction,
  ],
  [FieldMetadataType.TEXT]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.PHONE]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.EMAIL]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.DATE_TIME]: [
    FieldMetadataDefaultValueDateTime,
    FieldMetadataDefaultValueNowFunction,
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
  [FieldMetadataType.ADDRESS]: [FieldMetadataDefaultValueAddress],
  [FieldMetadataType.RAW_JSON]: [FieldMetadataDefaultValueRawJson],
};

export const validateDefaultValueForType = (
  type: FieldMetadataType,
  defaultValue: FieldMetadataDefaultValue,
): boolean => {
  if (defaultValue === null) return true;

  const validators = defaultValueValidatorsMap[type];

  if (!validators) return false;

  const isValid = validators.some((validator) => {
    const conputedDefaultValue = isCompositeFieldMetadataType(type)
      ? defaultValue
      : { value: defaultValue };

    const defaultValueInstance = plainToInstance<
      any,
      FieldMetadataClassValidation
    >(validator, conputedDefaultValue as FieldMetadataClassValidation);

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
