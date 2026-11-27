import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { OPTION_DESCRIPTION_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateMetadataOptionDescription = ({
  label: optionLabel,
  description: optionDescription,
}: {
  label: string;
  description?: unknown;
}): FlatFieldMetadataValidationError[] => {
  if (!isDefined(optionDescription)) {
    return [];
  }

  if (!isString(optionDescription)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Option "${optionLabel}" description must be a string`,
        userFriendlyMessage: msg`Option "${optionLabel}" has an invalid description`,
        value: optionDescription,
      },
    ];
  }

  if (optionDescription.length > OPTION_DESCRIPTION_MAX_CHAR_LENGTH) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Option "${optionLabel}" description exceeds ${OPTION_DESCRIPTION_MAX_CHAR_LENGTH} characters`,
        userFriendlyMessage: msg`Option "${optionLabel}" description exceeds ${OPTION_DESCRIPTION_MAX_CHAR_LENGTH} characters`,
        value: optionDescription,
      },
    ];
  }

  return [];
};
