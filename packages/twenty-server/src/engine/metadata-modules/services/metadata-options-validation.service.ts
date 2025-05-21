import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { sanitizeObjectStringProperties } from '../../../utils/sanitize-object-string-properties';
import { CreateFieldInput } from '../field-metadata/dtos/create-field.input';
import { UpdateFieldInput } from '../field-metadata/dtos/update-field.input';
import {
    FieldMetadataException,
    FieldMetadataExceptionCode,
} from '../field-metadata/field-metadata.exception';
import { FieldMetadataOptions } from '../field-metadata/interfaces/field-metadata-options.interface';
import { isEnumFieldMetadataType } from '../field-metadata/utils/is-enum-field-metadata-type.util';
import {
    beneathDatabaseIdentifierMinimumLength,
    exceedsDatabaseIdentifierMaximumLength,
} from '../utils/validate-database-identifier-length.utils';

const SNAKE_CASE_REGEX = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;

type Validator<T> = { validator: (str: T) => boolean; message: string };

export class MetadataOptionsValidationService {
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
        message: 'exceedsDatabaseIdentifierMaximumLength',
      },
      {
        validator: beneathDatabaseIdentifierMinimumLength,
        message: 'beneathDatabaseIdentifierMinimumLength',
      },
      {
        validator: (value) => !SNAKE_CASE_REGEX.test(value),
        message: 'Value must be in UPPER_CASE and follow snake_case',
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

  async validateMetadataOptions({
    fieldMetadataInput,
    fieldMetadataType,
  }: {
    fieldMetadataInput: CreateFieldInput | UpdateFieldInput;
    fieldMetadataType: FieldMetadataType;
  }): Promise<void> {
    if (!isEnumFieldMetadataType(fieldMetadataType)) {
      return;
    }

    const { options } = fieldMetadataInput;
    if (!isDefined(options) || options.length === 0) {
      throw new FieldMetadataException(
        'Options are required for enum fields',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    const sanitizedOptions = options.map((option) =>
      sanitizeObjectStringProperties(option, ['label', 'value', 'id']),
    );

    // Validate individual options
    for (const option of sanitizedOptions) {
      this.validateMetadataOptionId(option.id);
      this.validateMetadataOptionValue(option.value);
      this.validateMetadataOptionLabel(option.label);
    }

    // Validate duplicates
    this.validateDuplicates(sanitizedOptions);

    // Validate default value if present
    if (isDefined(fieldMetadataInput.defaultValue)) {
      await this.validateDefaultValue({
        fieldType: fieldMetadataType,
        options: sanitizedOptions,
        defaultValue: fieldMetadataInput.defaultValue,
      });
    }
  }

  async validateDefaultValue({
    fieldType,
    options,
    defaultValue,
  }: {
    fieldType: FieldMetadataType;
    options: FieldMetadataOptions;
    defaultValue: unknown;
  }): Promise<void> {
    if (!isDefined(defaultValue)) {
      return;
    }

    if (typeof defaultValue !== 'string') {
      throw new FieldMetadataException(
        'Default value must be a string for enum fields',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    const validOptionValues = new Set(options.map((option) => option.value));
    if (!validOptionValues.has(defaultValue)) {
      throw new FieldMetadataException(
        `Default value "${defaultValue}" is not a valid option`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }
}
