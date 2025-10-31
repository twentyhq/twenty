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
import { runFlatFieldMetadataValidators } from 'src/engine/metadata-modules/flat-field-metadata/utils/run-flat-field-metadata-validators.util';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import { isSnakeCaseString } from 'src/utils/is-snake-case-string';

const validateMetadataOptionId = (sanitizedId?: string) => {
  const validators: FlatMetadataValidator<string>[] = [
    {
      validator: (id) => !isDefined(id),
      message: msg`Option id is required`,
    },
    {
      validator: (id) => !z.string().uuid().safeParse(id).success,
      message: msg`Option id is invalid`,
    },
  ];

  return runFlatFieldMetadataValidators({
    elementToValidate: sanitizedId,
    validators,
  });
};

const validateMetadataOptionLabel = (
  sanitizedLabel: string,
): FlatFieldMetadataValidationError[] => {
  if (!isDefined(sanitizedLabel)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t`Option label is required`,
        userFriendlyMessage: msg`Option label is required`,
      },
    ];
  }

  if (!isNonEmptyString(sanitizedLabel)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t`Option label must be a string of at least one character`,
        userFriendlyMessage: msg`Option label format not supported`,
        value: sanitizedLabel,
      },
    ];
  }

  const validators: FlatMetadataValidator<string>[] = [
    {
      validator: exceedsDatabaseIdentifierMaximumLength,
      message: msg`Option label exceeds 63 characters`,
    },
    {
      validator: beneathDatabaseIdentifierMinimumLength,
      message: msg`Option label "${sanitizedLabel}" is beneath 1 character`,
    },
    {
      validator: (label) => label.includes(','),
      message: msg`Label must not contain a comma`,
    },
    {
      validator: (label) => !isNonEmptyString(label) || label === ' ',
      message: msg`Label must not be empty`,
    },
  ];

  return runFlatFieldMetadataValidators({
    elementToValidate: sanitizedLabel,
    validators,
  });
};

const validateMetadataOptionValue = (
  sanitizedValue: string,
): FlatFieldMetadataValidationError[] => {
  if (!isDefined(sanitizedValue)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t`Option value is required`,
        userFriendlyMessage: msg`Option value is required`,
      },
    ];
  }

  if (!isNonEmptyString(sanitizedValue)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t`Option value must be a string of at least one character`,
        userFriendlyMessage: msg`Option value format not supported`,
      },
    ];
  }

  const validators: FlatMetadataValidator<string>[] = [
    {
      validator: exceedsDatabaseIdentifierMaximumLength,
      message: msg`Option value exceeds 63 characters`,
    },
    {
      validator: beneathDatabaseIdentifierMinimumLength,
      message: msg`Option value "${sanitizedValue}" is beneath 1 character`,
    },
    {
      validator: (value) => !isSnakeCaseString(value),
      message: msg`Value must be in UPPER_CASE and follow snake_case "${sanitizedValue}"`,
    },
  ];

  return runFlatFieldMetadataValidators({
    elementToValidate: sanitizedValue,
    validators,
  });
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
    FlatMetadataValidator<
      FieldMetadataDefaultOption[] | FieldMetadataComplexOption[]
    >
  >((field) => ({
    message: msg`Duplicated option ${field}`,
    validator: () =>
      new Set(options.map((option) => option[field])).size !== options.length,
  }));

  return runFlatFieldMetadataValidators({
    elementToValidate: options,
    validators: duplicatedValidators,
  });
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
  if (typeof defaultValue !== 'string') {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Default value for select must be a string got ${defaultValue}`,
        userFriendlyMessage: msg`Default value must be a string`,
        value: defaultValue,
      },
    ];
  }

  const validators: FlatMetadataValidator<string>[] = [
    {
      validator: (value: string) => !QUOTED_STRING_REGEX.test(value),
      message: msg`Default value should be as quoted string`,
    },
    {
      validator: (value: string) =>
        !options.some(
          (option) => option.value === value.replace(QUOTED_STRING_REGEX, '$1'),
        ),
      message: msg`Default value "${defaultValue}" must be one of the option values`,
    },
  ];

  return runFlatFieldMetadataValidators({
    elementToValidate: defaultValue,
    validators,
  });
};

const validateMultiSelectDefaultValue = ({
  multiSelectDefaultValue,
  options,
}: {
  options: FieldMetadataOptions<EnumFieldMetadataType>;
  multiSelectDefaultValue: unknown;
}): FlatFieldMetadataValidationError[] => {
  if (!Array.isArray(multiSelectDefaultValue)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        userFriendlyMessage: msg`Multi-select field default value must be an array`,
        message: `Default value for multi-select must be an array got ${multiSelectDefaultValue}`,
        value: multiSelectDefaultValue,
      },
    ];
  }

  const validators: FlatMetadataValidator<string[]>[] = [
    {
      validator: (values) => values.length === 0,
      message: msg`If defined default value must contain at least one value`,
    },
    {
      validator: (values) => new Set(values).size !== values.length,
      message: msg`Default values must be unique`,
    },
  ];

  return [
    runFlatFieldMetadataValidators({
      elementToValidate: multiSelectDefaultValue,
      validators,
    }),
    multiSelectDefaultValue.flatMap((defaultValue) =>
      validateSelectDefaultValue({
        defaultValue,
        options,
      }),
    ),
  ].flat();
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
