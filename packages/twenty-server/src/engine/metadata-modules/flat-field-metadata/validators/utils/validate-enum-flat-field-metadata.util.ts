import { msg, t } from '@lingui/core/macro';
import { QUOTED_STRING_REGEX } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type EnumFieldMetadataType,
  type FieldMetadataOptions,
  type NonNullableRequired,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateFieldMetadataInputOptions } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-input-options.util';
import { validateSelectOptionColors } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-select-option-colors.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const validateSelectDefaultValue = ({
  defaultValue,
  options,
}: {
  options: FieldMetadataOptions<EnumFieldMetadataType>;
  defaultValue: string | string[];
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (typeof defaultValue !== 'string') {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Default value for select must be a string got ${defaultValue}`,
      userFriendlyMessage: msg`Default value must be a string`,
      value: defaultValue,
    });

    return errors;
  }

  if (!QUOTED_STRING_REGEX.test(defaultValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Default value should be as quoted string`,
      userFriendlyMessage: msg`Default value should be as quoted string`,
      value: defaultValue,
    });
  }

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

  if (!Array.isArray(multiSelectDefaultValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      userFriendlyMessage: msg`Multi-select field default value must be an array`,
      message: `Default value for multi-select must be an array got ${multiSelectDefaultValue}`,
      value: multiSelectDefaultValue,
    });

    return errors;
  }

  if (multiSelectDefaultValue.length === 0) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`If defined default value must contain at least one value`,
      userFriendlyMessage: msg`If defined default value must contain at least one value`,
      value: multiSelectDefaultValue,
    });
  }

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
}: Omit<UniversalFlatFieldMetadata<EnumFieldMetadataType>, 'defaultValue'> &
  NonNullableRequired<
    Pick<UniversalFlatFieldMetadata<EnumFieldMetadataType>, 'defaultValue'>
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
  flatEntityToValidate: universalFlatFieldMetadataToValidate,
  update,
}: FlatFieldMetadataTypeValidationArgs<EnumFieldMetadataType>): FlatFieldMetadataValidationError[] => {
  const optionsValidationErrors = validateFieldMetadataInputOptions(
    universalFlatFieldMetadataToValidate,
  );

  const isWritingOptions = !isDefined(update) || isDefined(update.options);

  const optionColorValidationErrors = isWritingOptions
    ? validateSelectOptionColors(universalFlatFieldMetadataToValidate)
    : [];

  const defaultValueValidationErrors = isDefined(
    universalFlatFieldMetadataToValidate.defaultValue,
  )
    ? validateFieldMetadataDefaultValue({
        ...universalFlatFieldMetadataToValidate,
        defaultValue: universalFlatFieldMetadataToValidate.defaultValue,
      })
    : [];

  // Option ids are not checked until the 2.57 backfill has regenerated legacy ones on every workspace.
  return [
    ...optionsValidationErrors,
    ...optionColorValidationErrors,
    ...defaultValueValidationErrors,
  ];
};
