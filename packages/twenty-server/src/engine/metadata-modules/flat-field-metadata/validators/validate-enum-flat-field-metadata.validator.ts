import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, NonNullableRequired } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import { EnumFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/enum-column-action.factory';
import { isSnakeCaseString } from 'src/utils/is-snake-case-string';

/// Move to dedicated file
const QUOTED_STRING_REGEX = /^['"](.*)['"]$/;

type Validator<T> = {
  validator: (str: T) => boolean;
  message: string;
};

const runValidator = <T>(
  elementToValidate: T,
  { message, validator }: Validator<T>,
): FailedFlatFieldMetadataValidationExceptions | undefined => {
  const shouldReturnError = validator(elementToValidate);

  if (shouldReturnError) {
    return new FieldMetadataException(
      message,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      {
        userFriendlyMessage: message,
      },
    );
  }
};

const runValidators = <T>(
  elementToValidate: T,
  validators: Validator<T>[],
): FailedFlatFieldMetadataValidationExceptions[] =>
  validators
    .map((validator) => runValidator(elementToValidate, validator))
    .filter(isDefined);
///

const validateMetadataOptionId = (sanitizedId?: string) => {
  const validators: Validator<string>[] = [
    {
      validator: (id) => !isDefined(id),
      message: 'Option id is required',
    },
    {
      validator: (id) => !z.string().uuid().safeParse(id).success,
      message: 'Option id is invalid',
    },
  ];

  return runValidators(sanitizedId, validators);
};

const validateMetadataOptionLabel = (sanitizedLabel: string) => {
  const validators: Validator<string>[] = [
    {
      validator: (label) => !isDefined(label),
      message: t`Option label is required`,
    },
    {
      validator: exceedsDatabaseIdentifierMaximumLength,
      message: t`Option label exceeds 63 characters`,
    },
    {
      validator: beneathDatabaseIdentifierMinimumLength,
      message: t`Option label "${sanitizedLabel}" is beneath 1 character`,
    },
    {
      validator: (label) => label.includes(','),
      message: t`Label must not contain a comma`,
    },
    {
      validator: (label) => !isNonEmptyString(label) || label === ' ',
      message: t`Label must not be empty`,
    },
  ];

  return runValidators(sanitizedLabel, validators);
};

const validateMetadataOptionValue = (sanitizedValue: string) => {
  const validators: Validator<string>[] = [
    {
      validator: (value) => !isDefined(value),
      message: t`Option value is required`,
    },
    {
      validator: exceedsDatabaseIdentifierMaximumLength,
      message: t`Option value exceeds 63 characters`,
    },
    {
      validator: beneathDatabaseIdentifierMinimumLength,
      message: t`Option value "${sanitizedValue}" is beneath 1 character`,
    },
    {
      validator: (value) => !isSnakeCaseString(value),
      message: `Value must be in UPPER_CASE and follow snake_case "${sanitizedValue}"`,
    },
  ];

  return runValidators(sanitizedValue, validators);
};

const validateDuplicates = (
  options: FieldMetadataOptions<EnumFieldMetadataType>,
) => {
  const fieldsToCheckForDuplicates = [
    'position',
    'id',
    'value',
  ] as const satisfies (keyof (
    | FieldMetadataDefaultOption[]
    | FieldMetadataComplexOption[]
  )[number])[];
  const duplicatedValidators = fieldsToCheckForDuplicates.map<
    Validator<FieldMetadataDefaultOption[] | FieldMetadataComplexOption[]>
  >((field) => ({
    message: `Duplicated option ${field}`,
    validator: () =>
      new Set(options.map((option) => option[field])).size !== options.length,
  }));

  return runValidators(options, duplicatedValidators);
};

const validateFieldMetadataInputOptions = <T extends EnumFieldMetadataType>(
  flatFieldMetadata: FlatFieldMetadata<T>,
) => {
  const { options } = flatFieldMetadata;

  if (!isDefined(options) || options.length === 0) {
    return [
      new FieldMetadataException(
        'Options are required for enum fields',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      ),
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

const validateSelectDefaultValue = (
  options: FieldMetadataOptions<EnumFieldMetadataType>,
  defaultValue: string | string[],
): FailedFlatFieldMetadataValidationExceptions[] => {
  if (typeof defaultValue !== 'string') {
    return [
      new FieldMetadataException(
        'Default value for multi-select must be a stringified array',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      ),
    ];
  }

  const validators: Validator<string>[] = [
    {
      validator: (value: string) => !QUOTED_STRING_REGEX.test(value),
      message: 'Default value should be as quoted string',
    },
    {
      validator: (value: string) =>
        !options.some(
          (option) => option.value === value.replace(QUOTED_STRING_REGEX, '$1'),
        ),
      message: `Default value "${defaultValue}" must be one of the option values`,
    },
  ];

  return runValidators(defaultValue, validators);
};

const validateMultiSelectDefaultValue = (
  options: FieldMetadataOptions<EnumFieldMetadataType>,
  multiSelectDefaultValue: unknown,
): FailedFlatFieldMetadataValidationExceptions[] => {
  if (!Array.isArray(multiSelectDefaultValue)) {
    return [
      new FieldMetadataException(
        'Default value for multi-select must be an array',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      ),
    ];
  }

  const validators: Validator<string[]>[] = [
    {
      validator: (values) => values.length === 0,
      message: 'If defined default value must contain at least one value',
    },
    {
      validator: (values) => new Set(values).size !== values.length,
      message: 'Default values must be unique',
    },
  ];

  return [
    runValidators(multiSelectDefaultValue, validators),
    multiSelectDefaultValue.flatMap((value) =>
      validateSelectDefaultValue(options, value),
    ),
  ].flat();
};

const validateFieldMetadataDefaultValue = (
  flatFieldMetadata: Omit<
    FlatFieldMetadata<EnumFieldMetadataType>,
    'defaultValue'
  > &
    NonNullableRequired<
      Pick<FlatFieldMetadata<EnumFieldMetadataType>, 'defaultValue'>
    >,
) => {
  switch (flatFieldMetadata.type) {
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RATING:
      return validateSelectDefaultValue(
        flatFieldMetadata.options,
        flatFieldMetadata.defaultValue,
      );
    case FieldMetadataType.MULTI_SELECT:
      return validateMultiSelectDefaultValue(
        flatFieldMetadata.options,
        flatFieldMetadata.defaultValue,
      );
    default: {
      assertUnreachable(
        flatFieldMetadata.type,
        'Should never occur, unknown field metadata enum type',
      );
    }
  }
};

export const validateEnumSelectFlatFieldMetadata = ({
  flatFieldMetadataToValidate,
}: ValidateOneFieldMetadataArgs<EnumFieldMetadataType>): FailedFlatFieldMetadataValidationExceptions[] => {
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
