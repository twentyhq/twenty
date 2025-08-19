import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { QUOTED_STRING_REGEX } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type EnumFieldMetadataType,
  type NonNullableRequired,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import {
  FailedFlatFieldMetadataValidation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { runFlatFieldMetadataValidators } from 'src/engine/metadata-modules/flat-field-metadata/utils/run-flat-field-metadata-validators.util';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import { isSnakeCaseString } from 'src/utils/is-snake-case-string';

const validateMetadataOptionId = ({
  fieldMetadataNameIdObjectMetadataId,
  sanitizedId,
}: {
  sanitizedId?: string;
  fieldMetadataNameIdObjectMetadataId: FlatFieldMetadataIdObjectIdAndName;
}) => {
  const validators: FlatMetadataValidator<string>[] = [
    {
      validator: (id) => !isDefined(id),
      message: t`Option id is required`,
    },
    {
      validator: (id) => !z.string().uuid().safeParse(id).success,
      message: t`Option id is invalid`,
    },
  ];

  return runFlatFieldMetadataValidators({
    elementToValidate: sanitizedId,
    validators,
    fieldMetadataNameIdObjectMetadataId,
  });
};

const validateMetadataOptionLabel = ({
  fieldMetadataNameIdObjectMetadataId,
  sanitizedLabel,
}: {
  sanitizedLabel: string;
  fieldMetadataNameIdObjectMetadataId: FlatFieldMetadataIdObjectIdAndName;
}) => {
  const validators: FlatMetadataValidator<string>[] = [
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

  return runFlatFieldMetadataValidators({
    elementToValidate: sanitizedLabel,
    fieldMetadataNameIdObjectMetadataId,
    validators,
  });
};

const validateMetadataOptionValue = ({
  fieldMetadataNameIdObjectMetadataId,
  sanitizedValue,
}: {
  sanitizedValue: string;
  fieldMetadataNameIdObjectMetadataId: FlatFieldMetadataIdObjectIdAndName;
}) => {
  const validators: FlatMetadataValidator<string>[] = [
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
      message: t`Value must be in UPPER_CASE and follow snake_case "${sanitizedValue}"`,
    },
  ];

  return runFlatFieldMetadataValidators({
    elementToValidate: sanitizedValue,
    validators,
    fieldMetadataNameIdObjectMetadataId,
  });
};

const validateDuplicates = ({
  fieldMetadataNameIdObjectMetadataId,
  options,
}: {
  options: FieldMetadataOptions<EnumFieldMetadataType>;
  fieldMetadataNameIdObjectMetadataId: FlatFieldMetadataIdObjectIdAndName;
}) => {
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
    message: t`Duplicated option ${field}`,
    validator: () =>
      new Set(options.map((option) => option[field])).size !== options.length,
  }));

  return runFlatFieldMetadataValidators({
    elementToValidate: options,
    validators: duplicatedValidators,
    fieldMetadataNameIdObjectMetadataId,
  });
};

const validateFieldMetadataInputOptions = <T extends EnumFieldMetadataType>(
  flatFieldMetadata: FlatFieldMetadata<T>,
): FailedFlatFieldMetadataValidation[] => {
  const { options } = flatFieldMetadata;

  const fieldMetadataNameIdObjectMetadataId: FlatFieldMetadataIdObjectIdAndName =
    {
      id: flatFieldMetadata.id,
      objectMetadataId: flatFieldMetadata.objectMetadataId,
      name: flatFieldMetadata.name,
    };
  if (!isDefined(options) || options.length === 0) {
    return [
      {
        error: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Options are required for enum fields',
        ...fieldMetadataNameIdObjectMetadataId,
        userFriendlyMessage: t`Options are required for enum fields`,
      },
    ];
  }

  const optionsValidationErrors = options.flatMap((option) =>
    [
      validateMetadataOptionId({
        sanitizedId: option.id,
        fieldMetadataNameIdObjectMetadataId,
      }),
      validateMetadataOptionValue({
        sanitizedValue: option.value,
        fieldMetadataNameIdObjectMetadataId,
      }),
      validateMetadataOptionLabel({
        sanitizedLabel: option.label,
        fieldMetadataNameIdObjectMetadataId,
      }),
    ].flat(),
  );

  const duplicatedValidationErrors = validateDuplicates({
    options,
    fieldMetadataNameIdObjectMetadataId,
  });

  return [...optionsValidationErrors, ...duplicatedValidationErrors];
};

const validateSelectDefaultValue = ({
  defaultValue,
  fieldMetadataNameIdObjectMetadataId,
  options,
}: {
  options: FieldMetadataOptions<EnumFieldMetadataType>;
  defaultValue: string | string[];
  fieldMetadataNameIdObjectMetadataId: FlatFieldMetadataIdObjectIdAndName;
}): FailedFlatFieldMetadataValidation[] => {
  if (typeof defaultValue !== 'string') {
    return [
      {
        error: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Default value for select must be a string got ${defaultValue}`,
        userFriendlyMessage: t`Default value must be a string`,
        ...fieldMetadataNameIdObjectMetadataId,
      },
    ];
  }

  const validators: FlatMetadataValidator<string>[] = [
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

  return runFlatFieldMetadataValidators({
    elementToValidate: defaultValue,
    validators,
    fieldMetadataNameIdObjectMetadataId,
  });
};

const validateMultiSelectDefaultValue = ({
  fieldMetadataNameIdObjectMetadataId,
  multiSelectDefaultValue,
  options,
}: {
  options: FieldMetadataOptions<EnumFieldMetadataType>;
  multiSelectDefaultValue: unknown;
  fieldMetadataNameIdObjectMetadataId: FlatFieldMetadataIdObjectIdAndName;
}): FailedFlatFieldMetadataValidation[] => {
  if (!Array.isArray(multiSelectDefaultValue)) {
    return [
      {
        error: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        userFriendlyMessage: t`Multi-select field default value must be an array`,
        message: `Default value for multi-select must be an array got ${multiSelectDefaultValue}`,
        ...fieldMetadataNameIdObjectMetadataId,
      },
    ];
  }

  const validators: FlatMetadataValidator<string[]>[] = [
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
    runFlatFieldMetadataValidators({
      elementToValidate: multiSelectDefaultValue,
      validators,
      fieldMetadataNameIdObjectMetadataId,
    }),
    multiSelectDefaultValue.flatMap((defaultValue) =>
      validateSelectDefaultValue({
        defaultValue,
        options,
        fieldMetadataNameIdObjectMetadataId,
      }),
    ),
  ].flat();
};

const validateFieldMetadataDefaultValue = ({
  defaultValue,
  options,
  type,
  name,
  id,
  objectMetadataId,
}: Omit<FlatFieldMetadata<EnumFieldMetadataType>, 'defaultValue'> &
  NonNullableRequired<
    Pick<FlatFieldMetadata<EnumFieldMetadataType>, 'defaultValue'>
  >) => {
  const fieldMetadataNameIdObjectMetadataId = {
    id,
    name,
    objectMetadataId,
  };
  switch (type) {
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RATING:
      return validateSelectDefaultValue({
        defaultValue,
        options,
        fieldMetadataNameIdObjectMetadataId,
      });
    case FieldMetadataType.MULTI_SELECT:
      return validateMultiSelectDefaultValue({
        multiSelectDefaultValue: defaultValue,
        options,
        fieldMetadataNameIdObjectMetadataId,
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
  flatFieldMetadataToValidate,
}: ValidateOneFieldMetadataArgs<EnumFieldMetadataType>): FailedFlatFieldMetadataValidation[] => {
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
