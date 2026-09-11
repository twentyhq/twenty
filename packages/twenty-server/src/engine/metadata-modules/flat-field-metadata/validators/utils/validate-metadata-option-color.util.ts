import { msg } from '@lingui/core/macro';
import { TAG_COLORS } from 'twenty-shared/constants';
import { type FieldMetadataComplexOption } from 'twenty-shared/types';
import { isDefined, isTagColor } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateMetadataOptionColor = ({
  label: optionLabel,
  color: optionColor,
}: FieldMetadataComplexOption): FlatFieldMetadataValidationError[] => {
  if (!isDefined(optionColor) || isTagColor(optionColor)) {
    return [];
  }

  return [
    {
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Option "${optionLabel}" color "${optionColor}" is not supported. Supported colors: ${TAG_COLORS.join(', ')}`,
      userFriendlyMessage: msg`Option "${optionLabel}" has an unsupported color`,
      value: optionColor,
    },
  ];
};
