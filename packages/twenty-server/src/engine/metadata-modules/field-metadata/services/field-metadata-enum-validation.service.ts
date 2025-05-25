import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import { isSnakeCaseString } from 'src/utils/is-snake-case-string';

type Validator<T> = { validator: (str: T) => boolean; message: string };

type FieldMetadataUpdateCreateInput = CreateFieldInput | UpdateFieldInput;

type ValidateEnumFieldMetadataArgs = {
  existingFieldMetadata?: FieldMetadataEntity;
  fieldMetadataInput: FieldMetadataUpdateCreateInput;
  fieldMetadataType: FieldMetadataType;
};

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
        message,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }

  private validateMetadataOptionId(sanitizedId?: string) {
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

    validators.forEach((validator) =>
      this.validatorRunner(sanitizedId, validator),
    );
  }

  private validateMetadataOptionLabel(sanitizedLabel: string) {
    const validators: Validator<string>[] = [
      {
        validator: (label) => !isDefined(label),
        message: 'Option label is required',
      },
      {
        validator: exceedsDatabaseIdentifierMaximumLength,
        message: `Option label "${sanitizedLabel}" exceeds 63 characters`,
      },
      {
        validator: beneathDatabaseIdentifierMinimumLength,
        message: `Option label "${sanitizedLabel}" is beneath 1 character`,
      },
      {
        validator: (label) => label.includes(','),
        message: 'Label must not contain a comma',
      },
      {
        validator: (label) => !isNonEmptyString(label) || label === ' ',
        message: 'Label must not be empty',
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
        message: 'Option value is required',
      },
      {
        validator: exceedsDatabaseIdentifierMaximumLength,
        message: `Option value "${sanitizedValue}" exceeds 63 characters`,
      },
      {
        validator: beneathDatabaseIdentifierMinimumLength,
        message: `Option value "${sanitizedValue}" is beneath 1 character`,
      },
      {
        validator: (value) => !isSnakeCaseString(value),
        message: `Value must be in UPPER_CASE and follow snake_case "${sanitizedValue}"`,
      },
    ];

    validators.forEach((validator) =>
      this.validatorRunner(sanitizedValue, validator),
    );
  }

  private validateDuplicates(options: FieldMetadataOptions) {
    const seenOptionIds = new Set<FieldMetadataOptions[number]['id']>();
    const seenOptionValues = new Set<FieldMetadataOptions[number]['value']>();
    const seenOptionPositions = new Set<
      FieldMetadataOptions[number]['position']
    >();

    for (const option of options) {
      if (seenOptionIds.has(option.id)) {
        throw new FieldMetadataException(
          `Duplicated option id "${option.id}"`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }

      if (seenOptionValues.has(option.value)) {
        throw new FieldMetadataException(
          `Duplicated option value "${option.value}"`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }

      if (seenOptionPositions.has(option.position)) {
        throw new FieldMetadataException(
          `Duplicated option position "${option.position}"`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }

      seenOptionIds.add(option.id);
      seenOptionValues.add(option.value);
      seenOptionPositions.add(option.position);
    }
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

  private isValidEnumValue(
    value: FieldMetadataDefaultValue | string,
    options: FieldMetadataOptions,
  ): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    const enumOptions = options.map((option) => option.value);
    const formattedValue = value.replace(/^['"](.*)['"]$/, '$1');

    return enumOptions.includes(formattedValue);
  }

  private validateSelectDefaultValue(
    options: FieldMetadataOptions,
    defaultValue: FieldMetadataDefaultValue,
  ) {
    if (!this.isValidEnumValue(defaultValue, options)) {
      throw new FieldMetadataException(
        `Default value for existing options is invalid: ${defaultValue}`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }

  private validateMultiSelectDefaultValue(
    options: FieldMetadataOptions,
    defaultValues: FieldMetadataDefaultValue,
  ) {
    const isInvalid =
      !Array.isArray(defaultValues) ||
      defaultValues.some((value) => !this.isValidEnumValue(value, options));

    if (isInvalid) {
      throw new FieldMetadataException(
        `Default value for multi-select options is invalid: ${defaultValues}`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }

  private validateDefaultValueByType(
    fieldType: FieldMetadataType,
    options: FieldMetadataOptions,
    defaultValue: FieldMetadataDefaultValue,
  ) {
    switch (fieldType) {
      case FieldMetadataType.SELECT:
        this.validateSelectDefaultValue(options, defaultValue);
        break;
      case FieldMetadataType.MULTI_SELECT:
        this.validateMultiSelectDefaultValue(options, defaultValue);
        break;
      // TODO: Determine if RATING should be handled here
      // case FieldMetadataType.RATING:
      //   break;
    }
  }

  async validateEnumFieldMetadataInput({
    fieldMetadataInput,
    fieldMetadataType,
    existingFieldMetadata,
  }: ValidateEnumFieldMetadataArgs) {
    if (!isEnumFieldMetadataType(fieldMetadataType)) {
      return;
    }

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

      this.validateDefaultValueByType(
        fieldMetadataType,
        options,
        fieldMetadataInput.defaultValue,
      );
    }
  }
}
