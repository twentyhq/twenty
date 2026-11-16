import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { IDENTIFIER_MIN_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-min-char-length.constants';

export const validateMetadataOptionLabel = (
  sanitizedLabel: string,
): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (!isDefined(sanitizedLabel)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option label is required`,
      userFriendlyMessage: msg`Option label is required`,
    });

    return errors;
  }

  if (!isNonEmptyString(sanitizedLabel)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option label must be a string of at least one character`,
      userFriendlyMessage: msg`Option label format not supported`,
      value: sanitizedLabel,
    });

    return errors;
  }

  if (sanitizedLabel.length > IDENTIFIER_MAX_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option label exceeds 63 characters`,
      userFriendlyMessage: msg`Option label exceeds 63 characters`,
      value: sanitizedLabel,
    });
  }

  if (sanitizedLabel.length < IDENTIFIER_MIN_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Option label "${sanitizedLabel}" is beneath 1 character`,
      userFriendlyMessage: msg`Option label "${sanitizedLabel}" is beneath 1 character`,
      value: sanitizedLabel,
    });
  }

  if (sanitizedLabel.includes(',')) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Label must not contain a comma`,
      userFriendlyMessage: msg`Label must not contain a comma`,
      value: sanitizedLabel,
    });
  }

  if (!isNonEmptyString(sanitizedLabel) || sanitizedLabel === ' ') {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Label must not be empty`,
      userFriendlyMessage: msg`Label must not be empty`,
      value: sanitizedLabel,
    });
  }

  return errors;
};
