import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { IDENTIFIER_MIN_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-min-char-length.constants';
import { isSnakeCaseString } from 'src/utils/is-snake-case-string';

export const validateMetadataOptionValue = (
  sanitizedValue: string,
): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (!isDefined(sanitizedValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option value is required`,
      userFriendlyMessage: msg`Option value is required`,
    });

    return errors;
  }

  if (!isNonEmptyString(sanitizedValue)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option value must be a string of at least one character`,
      userFriendlyMessage: msg`Option value format not supported`,
      value: sanitizedValue,
    });

    return errors;
  }

  if (sanitizedValue.length > IDENTIFIER_MAX_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option value exceeds 63 characters`,
      userFriendlyMessage: msg`Option value exceeds 63 characters`,
      value: sanitizedValue,
    });
  }

  if (sanitizedValue.length < IDENTIFIER_MIN_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option value "${sanitizedValue}" is beneath 1 character`,
      userFriendlyMessage: msg`Option value "${sanitizedValue}" is beneath 1 character`,
      value: sanitizedValue,
    });
  }

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
