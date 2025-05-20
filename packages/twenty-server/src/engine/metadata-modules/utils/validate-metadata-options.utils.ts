import { isNonEmptyString } from '@sniptt/guards';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import { sanitizeObjectStringProperties } from 'src/utils/sanitize-object-string-properties';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

const SNAKE_CASE_REGEX = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;
type Validator<T> = { validator: (str: T) => boolean; message: string };
const validatorRunner = <T>(
  elementToValidate: T,
  { message, validator }: Validator<T>,
) => {
  const shouldThrow = validator(elementToValidate);
  if (shouldThrow) {
    throw new FieldMetadataException(
      message,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
};

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

  validators.forEach((validator) => validatorRunner(sanitizedId, validator));
};

const validateMetadataOptionLabel = (sanitizedLabel: string) => {
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

  validators.forEach((validator) => validatorRunner(sanitizedLabel, validator));
};

const validateMetadataOptionValue = (sanitizedValue: string) => {
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

  validators.forEach((validator) => validatorRunner(sanitizedValue, validator));
};

export const validateMetadataOptions = async ({
  fieldMetadataInput,
  fieldMetadataType,
}: {
  fieldMetadataInput: CreateFieldInput | UpdateFieldInput;
  fieldMetadataType: FieldMetadataType;
}) => {
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

  const seenOptionIds = new Set<FieldMetadataOptions[number]['id']>();
  const seenOptionValues = new Set<FieldMetadataOptions[number]['value']>();
  const seenOptionPositions = new Set<
    FieldMetadataOptions[number]['position']
  >();
  const sanitizedOptions = options.map((option) =>
    sanitizeObjectStringProperties(option, ['label', 'value', 'id']),
  );

  for (const option of sanitizedOptions) {
    validateMetadataOptionId(option.id);
    validateMetadataOptionValue(option.value);
    validateMetadataOptionLabel(option.label);

    seenOptionValues.has(option.value);

    const duplicatedOptionId = seenOptionIds.has(option.id);
    if (duplicatedOptionId) {
      throw new FieldMetadataException(
        `Duplicated option id "${option.id}"`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    const duplicatedOptionValue = seenOptionIds.has(option.id);
    if (duplicatedOptionValue) {
      throw new FieldMetadataException(
        `Duplicated option value "${option.value}"`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    const duplicatedOptionPosition = seenOptionIds.has(option.id);
    if (duplicatedOptionPosition) {
      throw new FieldMetadataException(
        `Duplicated option position "${option.value}"`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    seenOptionValues.add(option.value);
    seenOptionIds.add(option.id);
    seenOptionPositions.add(option.position);
  }

  if (isDefined(fieldMetadataInput.defaultValue)) {
    await this.fieldMetadataValidationService.validateDefaultValueOrThrow({
      fieldType: fieldMetadataType,
      options,
      defaultValue: fieldMetadataInput.defaultValue ?? null,
    });
  }
};
