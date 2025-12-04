import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { QUOTED_STRING_REGEX } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type EnumFieldMetadataType,
  type NonNullableRequired,
  type FieldMetadataOptions,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-max-char-length.constants';
import { IDENTIFIER_MIN_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-min-char-length.constants';
import { isSnakeCaseString } from 'src/utils/is-snake-case-string';

const validateMetadataOptionId = (sanitizedId?: string) => {
  const errors: FlatFieldMetadataValidationError[] = [];

  // Check if id is defined
  if (!isDefined(sanitizedId)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option id is required`,
      userFriendlyMessage: msg`Option id is required`,
    });
  }

  // Check if id is a valid UUID
  if (!z.string().uuid().safeParse(sanitizedId).success) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option id is invalid`,
      userFriendlyMessage: msg`Option id is invalid`,
      value: sanitizedId,
    });
  }

  return errors;
};

const validateMetadataOptionLabel = (
  sanitizedLabel: string,
): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  // Check if label is defined
  if (!isDefined(sanitizedLabel)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option label is required`,
      userFriendlyMessage: msg`Option label is required`,
    });

    return errors;
  }

  // Check if label is a non-empty string
  if (!isNonEmptyString(sanitizedLabel)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option label must be a string of at least one character`,
      userFriendlyMessage: msg`Option label format not supported`,
      value: sanitizedLabel,
    });

    return errors;
  }

  // Check if label exceeds maximum length
  if (sanitizedLabel.length > IDENTIFIER_MAX_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option label exceeds 63 characters`,
      userFriendlyMessage: msg`Option label exceeds 63 characters`,
      value: sanitizedLabel,
    });
  }

  // Check if label is beneath minimum length
  if (sanitizedLabel.length < IDENTIFIER_MIN_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option label "${sanitizedLabel}" is beneath 1 character`,
      userFriendlyMessage: msg`Option label "${sanitizedLabel}" is beneath 1 character`,
      value: sanitizedLabel,
    });
  }

  // Check if label contains a comma
  if (sanitizedLabel.includes(',')) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Label must not contain a comma`,
      userFriendlyMessage: msg`Label must not contain a comma`,
      value: sanitizedLabel,
    });
  }

  // Check if label is empty or just a space
  if (!isNonEmptyString(sanitizedLabel) || sanitizedLabel === ' ') {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Label must not be empty`,
      userFriendlyMessage: msg`Label must not be empty`,
      value: sanitizedLabel,
    });
  }

  return errors;
};

const validateMetadataOptionValue = (
  sanitizedValue: string,
): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  // Check if value is defined
  if (!isDefined(sanitizedValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option value is required`,
      userFriendlyMessage: msg`Option value is required`,
    });

    return errors;
  }

  // Check if value is a non-empty string
  if (!isNonEmptyString(sanitizedValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option value must be a string of at least one character`,
      userFriendlyMessage: msg`Option value format not supported`,
      value: sanitizedValue,
    });

    return errors;
  }

  // Check if value exceeds maximum length
  if (sanitizedValue.length > IDENTIFIER_MAX_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option value exceeds 63 characters`,
      userFriendlyMessage: msg`Option value exceeds 63 characters`,
      value: sanitizedValue,
    });
  }

  // Check if value is beneath minimum length
  if (sanitizedValue.length < IDENTIFIER_MIN_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option value "${sanitizedValue}" is beneath 1 character`,
      userFriendlyMessage: msg`Option value "${sanitizedValue}" is beneath 1 character`,
      value: sanitizedValue,
    });
  }

  // Check if value is in snake_case
  if (!isSnakeCaseString(sanitizedValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Value must be in UPPER_CASE and follow snake_case "${sanitizedValue}"`,
      userFriendlyMessage: msg`Value must be in UPPER_CASE and follow snake_case "${sanitizedValue}"`,
      value: sanitizedValue,
    });
  }

  return errors;
};

const validateDuplicates = (
  options: FieldMetadataOptions<EnumFieldMetadataType>,
) => {
  const errors: FlatFieldMetadataValidationError[] = [];

  const fieldsToCheckForDuplicates = [
    'position',
    'id',
    'value',
  ] as const satisfies (keyof (
    | FieldMetadataDefaultOption[]
    | FieldMetadataComplexOption[]
  )[number])[];

  // Check for duplicates in each field
  for (const field of fieldsToCheckForDuplicates) {
    const hasDuplicates =
      new Set(options.map((option) => option[field])).size !== options.length;

    if (hasDuplicates) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t`Duplicated option ${field}`,
        userFriendlyMessage: msg`Duplicated option ${field}`,
        value: options,
      });
    }
  }

  return errors;
};

const validateFieldMetadataInputOptions = <T extends EnumFieldMetadataType>(
  flatFieldMetadata: FlatFieldMetadata<T>,
): FlatFieldMetadataValidationError[] => {
  const { options } = flatFieldMetadata;

  if (!isDefined(options) || options.length === 0) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Options are required for enum fields',
        userFriendlyMessage: msg`Options are required for enum fields`,
        value: options,
      },
    ];
  }

  const optionsValidationErrors = options.flatMap((option) =>
    [
      validateMetadataOptionId(option.id),
      validateMetadataOptionValue(option.value),
      validateMetadataOptionLabel(option.label),
    ].flat(),
  );

  const duplicatedValidationErrors = validateDuplicates(options);

  return [...optionsValidationErrors, ...duplicatedValidationErrors];
};

const validateSelectDefaultValue = ({
  defaultValue,
  options,
}: {
  options: FieldMetadataOptions<EnumFieldMetadataType>;
  defaultValue: string | string[];
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  // Check if defaultValue is a string
  if (typeof defaultValue !== 'string') {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Default value for select must be a string got ${defaultValue}`,
      userFriendlyMessage: msg`Default value must be a string`,
      value: defaultValue,
    });

    return errors;
  }

  // Check if defaultValue is a quoted string
  if (!QUOTED_STRING_REGEX.test(defaultValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Default value should be as quoted string`,
      userFriendlyMessage: msg`Default value should be as quoted string`,
      value: defaultValue,
    });
  }

  // Check if defaultValue matches one of the option values
  const matchesOptionValue = options.some(
    (option) =>
      option.value === defaultValue.replace(QUOTED_STRING_REGEX, '$1'),
  );

  if (!matchesOptionValue) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Default value "${defaultValue}" must be one of the option values`,
      userFriendlyMessage: msg`Default value "${defaultValue}" must be one of the option values`,
      value: defaultValue,
    });
  }

  return errors;
};

const validateMultiSelectDefaultValue = ({
  multiSelectDefaultValue,
  options,
}: {
  options: FieldMetadataOptions<EnumFieldMetadataType>;
  multiSelectDefaultValue: unknown;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  // Check if multiSelectDefaultValue is an array
  if (!Array.isArray(multiSelectDefaultValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      userFriendlyMessage: msg`Multi-select field default value must be an array`,
      message: `Default value for multi-select must be an array got ${multiSelectDefaultValue}`,
      value: multiSelectDefaultValue,
    });

    return errors;
  }

  // Check if array is empty
  if (multiSelectDefaultValue.length === 0) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`If defined default value must contain at least one value`,
      userFriendlyMessage: msg`If defined default value must contain at least one value`,
      value: multiSelectDefaultValue,
    });
  }

  // Check if array has duplicates
  if (
    new Set(multiSelectDefaultValue).size !== multiSelectDefaultValue.length
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Default values must be unique`,
      userFriendlyMessage: msg`Default values must be unique`,
      value: multiSelectDefaultValue,
    });
  }

  // Validate each individual default value
  for (const defaultValue of multiSelectDefaultValue) {
    errors.push(
      ...validateSelectDefaultValue({
        defaultValue,
        options,
      }),
    );
  }

  return errors;
};

const validateFieldMetadataDefaultValue = ({
  defaultValue,
  options,
  type,
}: Omit<FlatFieldMetadata<EnumFieldMetadataType>, 'defaultValue'> &
  NonNullableRequired<
    Pick<FlatFieldMetadata<EnumFieldMetadataType>, 'defaultValue'>
  >) => {
  switch (type) {
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RATING:
      return validateSelectDefaultValue({
        defaultValue,
        options,
      });
    case FieldMetadataType.MULTI_SELECT:
      return validateMultiSelectDefaultValue({
        multiSelectDefaultValue: defaultValue,
        options,
      });
    default: {
      assertUnreachable(
        type,
        'Should never occur, unknown field metadata enum type',
      );
    }
  }
};

export const validateEnumSelectFlatFieldMetadata = ({
  flatEntityToValidate: flatFieldMetadataToValidate,
}: FlatFieldMetadataTypeValidationArgs<EnumFieldMetadataType>): FlatFieldMetadataValidationError[] => {
  const optionsValidationErrors = validateFieldMetadataInputOptions(
    flatFieldMetadataToValidate,
  );

  const defaultValueValidationErrors = isDefined(
    flatFieldMetadataToValidate.defaultValue,
  )
    ? validateFieldMetadataDefaultValue({
        ...flatFieldMetadataToValidate,
        defaultValue: flatFieldMetadataToValidate.defaultValue,
      })
    : [];

  return [...optionsValidationErrors, ...defaultValueValidationErrors];
};
