import { msg, t } from '@lingui/core/macro';
import {
  type EnumFieldMetadataType,
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
  type FieldMetadataOptions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateMetadataOptionLabel } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-metadata-option-label.util';
import { validateMetadataOptionValue } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-metadata-option-value.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const validateMetadataOptionId = (sanitizedId?: string) => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (!isDefined(sanitizedId)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option id is required`,
      userFriendlyMessage: msg`Option id is required`,
    });
  }

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

export const validateFieldMetadataInputOptions = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata<EnumFieldMetadataType>,
): FlatFieldMetadataValidationError[] => {
  const { options } = universalFlatFieldMetadata;

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
