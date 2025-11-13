import { Injectable } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type EnumFieldMetadataType,
  FieldMetadataType,
  type FieldMetadataOptions,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type EnumFieldMetadataUnionType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import { isSnakeCaseString } from 'src/utils/is-snake-case-string';

type Validator<T> = {
  validator: (str: T) => boolean;
  message: MessageDescriptor;
};

type FieldMetadataUpdateCreateInput = CreateFieldInput | UpdateFieldInput;

type ValidateEnumFieldMetadataArgs = {
  existingFieldMetadata?: Pick<
    FieldMetadataEntity,
    'type' | 'isNullable' | 'defaultValue' | 'options'
  >;
  fieldMetadataInput: FieldMetadataUpdateCreateInput;
  fieldMetadataType: EnumFieldMetadataUnionType;
};

const QUOTED_STRING_REGEX = /^['"](.*)['"]$/;

@Injectable()
export class FieldMetadataEnumValidationService {
  constructor() {}

  private validatorRunner<T>(
    elementToValidate: T,
    { message, validator }: Validator<T>,
  ) {
    const shouldThrow = validator(elementToValidate);

    if (shouldThrow) {
      throw new FieldMetadataException(
        message.message ?? 'Invalid field input',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        {
          userFriendlyMessage: message,
        },
      );
    }
  }

  private validateMetadataOptionId(sanitizedId?: string) {
    const validators: Validator<string>[] = [
      {
        validator: (id) => !isDefined(id),
        message: msg`Option id is required`,
      },
      {
        validator: (id) => !z.string().uuid().safeParse(id).success,
        message: msg`Option id is invalid`,
      },
    ];

    validators.forEach((validator) =>
      this.validatorRunner(sanitizedId, validator),
    );
  }

  private validateMetadataOptionLabel(sanitizedLabel: string) {
    const validators: Validator<string>[] = [
      {
        validator: (label) => !isDefined(label),
        message: msg`Option label is required`,
      },
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

    validators.forEach((validator) =>
      this.validatorRunner(sanitizedLabel, validator),
    );
  }

  private validateMetadataOptionValue(sanitizedValue: string) {
    const validators: Validator<string>[] = [
      {
        validator: (value) => !isDefined(value),
        message: msg`Option value is required`,
      },
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

    validators.forEach((validator) =>
      this.validatorRunner(sanitizedValue, validator),
    );
  }

  private validateDuplicates(
    options: FieldMetadataOptions<EnumFieldMetadataType>,
  ) {
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
      message: msg`Duplicated option ${field}`,
      validator: () =>
        new Set(options.map((option) => option[field])).size !== options.length,
    }));

    duplicatedValidators.forEach((validator) =>
      this.validatorRunner(options, validator),
    );
  }

  private validateFieldMetadataInputOptions(
    fieldMetadataInput: FieldMetadataUpdateCreateInput,
  ) {
    const { options } = fieldMetadataInput;

    if (!isDefined(options) || options.length === 0) {
      throw new FieldMetadataException(
        'Options are required for enum fields',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    for (const option of options) {
      this.validateMetadataOptionId(option.id);
      this.validateMetadataOptionValue(option.value);
      this.validateMetadataOptionLabel(option.label);
    }

    this.validateDuplicates(options);
  }

  private validateSelectDefaultValue(
    options: FieldMetadataOptions<EnumFieldMetadataType>,
    defaultValue: unknown,
  ) {
    if (typeof defaultValue !== 'string') {
      throw new FieldMetadataException(
        'Default value for multi-select must be a stringified array',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    const validators: Validator<string>[] = [
      {
        validator: (value: string) => !QUOTED_STRING_REGEX.test(value),
        message: msg`Default value should be as quoted string`,
      },
      {
        validator: (value: string) =>
          !options.some(
            (option) =>
              option.value === value.replace(QUOTED_STRING_REGEX, '$1'),
          ),
        message: msg`Default value "${defaultValue}" must be one of the option values`,
      },
    ];

    validators.forEach((validator) =>
      this.validatorRunner(defaultValue, validator),
    );
  }

  private validateMultiSelectDefaultValue(
    options: FieldMetadataOptions<EnumFieldMetadataType>,
    defaultValue: unknown,
  ) {
    if (!Array.isArray(defaultValue)) {
      throw new FieldMetadataException(
        'Default value for multi-select must be an array',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    const validators: Validator<string[]>[] = [
      {
        validator: (values) => values.length === 0,
        message: msg`If defined default value must contain at least one value`,
      },
      {
        validator: (values) => new Set(values).size !== values.length,
        message: msg`Default values must be unique`,
      },
    ];

    validators.forEach((validator) =>
      this.validatorRunner(defaultValue, validator),
    );

    defaultValue.forEach((value) => {
      this.validateSelectDefaultValue(options, value);
    });
  }

  private validateFieldMetadataDefaultValue(
    fieldType: EnumFieldMetadataType,
    options: FieldMetadataOptions<EnumFieldMetadataType>,
    defaultValue: unknown,
  ) {
    switch (fieldType) {
      case FieldMetadataType.SELECT:
        this.validateSelectDefaultValue(options, defaultValue);
        break;
      case FieldMetadataType.MULTI_SELECT:
        this.validateMultiSelectDefaultValue(options, defaultValue);
        break;
      case FieldMetadataType.RATING:
        // TODO: Determine if RATING should be handled here
        break;
      default: {
        assertUnreachable(
          fieldType,
          'Should never occur, unknown field metadata enum type',
        );
      }
    }
  }

  async validateEnumFieldMetadataInput({
    fieldMetadataInput,
    fieldMetadataType,
    existingFieldMetadata,
  }: ValidateEnumFieldMetadataArgs) {
    const isUpdate = isDefined(existingFieldMetadata);
    const shouldSkipFieldMetadataInputOptionsValidation =
      isUpdate && fieldMetadataInput.options === undefined;

    if (!shouldSkipFieldMetadataInputOptionsValidation) {
      this.validateFieldMetadataInputOptions(fieldMetadataInput);
    }

    if (isDefined(fieldMetadataInput.defaultValue)) {
      const options =
        fieldMetadataInput.options ?? existingFieldMetadata?.options;

      if (!isDefined(options)) {
        throw new FieldMetadataException(
          'Should never occur, could not retrieve any options to validate default value',
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }

      this.validateFieldMetadataDefaultValue(
        fieldMetadataType,
        options,
        fieldMetadataInput.defaultValue,
      );
    }
  }
}
