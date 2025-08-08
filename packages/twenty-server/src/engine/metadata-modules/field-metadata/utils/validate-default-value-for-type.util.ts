import { plainToInstance } from 'class-transformer';
import { type ValidationError, validateSync } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  type FieldMetadataClassValidation,
  type FieldMetadataDefaultValue,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  FieldMetadataDefaultActor,
  FieldMetadataDefaultValueAddress,
  FieldMetadataDefaultValueBoolean,
  FieldMetadataDefaultValueCurrency,
  FieldMetadataDefaultValueDate,
  FieldMetadataDefaultValueDateTime,
  FieldMetadataDefaultValueEmails,
  FieldMetadataDefaultValueFullName,
  FieldMetadataDefaultValueLinks,
  FieldMetadataDefaultValueNowFunction,
  FieldMetadataDefaultValueNumber,
  FieldMetadataDefaultValuePhones,
  FieldMetadataDefaultValueRawJson,
  FieldMetadataDefaultValueRichTextV2,
  FieldMetadataDefaultValueString,
  FieldMetadataDefaultValueStringArray,
  FieldMetadataDefaultValueUuidFunction,
} from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const defaultValueValidatorsMap = {
  [FieldMetadataType.UUID]: [
    FieldMetadataDefaultValueString,
    FieldMetadataDefaultValueUuidFunction,
  ],
  [FieldMetadataType.TEXT]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.DATE_TIME]: [
    FieldMetadataDefaultValueDateTime,
    FieldMetadataDefaultValueNowFunction,
  ],
  [FieldMetadataType.DATE]: [FieldMetadataDefaultValueDate],
  [FieldMetadataType.BOOLEAN]: [FieldMetadataDefaultValueBoolean],
  [FieldMetadataType.NUMBER]: [FieldMetadataDefaultValueNumber],
  [FieldMetadataType.NUMERIC]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.CURRENCY]: [FieldMetadataDefaultValueCurrency],
  [FieldMetadataType.FULL_NAME]: [FieldMetadataDefaultValueFullName],
  [FieldMetadataType.RATING]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.SELECT]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.MULTI_SELECT]: [FieldMetadataDefaultValueStringArray],
  [FieldMetadataType.ADDRESS]: [FieldMetadataDefaultValueAddress],
  [FieldMetadataType.RICH_TEXT_V2]: [FieldMetadataDefaultValueRichTextV2],
  [FieldMetadataType.RICH_TEXT]: [FieldMetadataDefaultValueString],
  [FieldMetadataType.RAW_JSON]: [FieldMetadataDefaultValueRawJson],
  [FieldMetadataType.LINKS]: [FieldMetadataDefaultValueLinks],
  [FieldMetadataType.ACTOR]: [FieldMetadataDefaultActor],
  [FieldMetadataType.EMAILS]: [FieldMetadataDefaultValueEmails],
  [FieldMetadataType.PHONES]: [FieldMetadataDefaultValuePhones],
};

type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

export const validateDefaultValueForType = (
  type: FieldMetadataType,
  defaultValue: FieldMetadataDefaultValue,
): ValidationResult => {
  if (defaultValue === null) {
    return {
      isValid: true,
      errors: [],
    };
  }

  // @ts-expect-error legacy noImplicitAny
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validators = defaultValueValidatorsMap[type] as any[];

  if (!validators) {
    return {
      isValid: false,
      errors: [],
    };
  }

  const validationResults = validators.map((validator) => {
    const computedDefaultValue = isCompositeFieldMetadataType(type)
      ? defaultValue
      : { value: defaultValue };

    const defaultValueInstance = plainToInstance<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      FieldMetadataClassValidation
    >(validator, computedDefaultValue as FieldMetadataClassValidation);

    const errors = validateSync(defaultValueInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
    };
  });

  const isValid = validationResults.some((result) => result.isValid);

  return {
    isValid,
    errors: validationResults.flatMap((result) => result.errors),
  };
};
