import { msg } from '@lingui/core/macro';
import { TAG_COLORS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

const OPTION_COLOR_SCHEMA = z.enum(TAG_COLORS);

export const validateMetadataOptionColor = (
  color: unknown,
): FlatFieldMetadataValidationError[] => {
  if (!isDefined(color)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Option color is required',
        userFriendlyMessage: msg`Option color is required`,
      },
    ];
  }

  if (!OPTION_COLOR_SCHEMA.safeParse(color).success) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Option color must be a supported color',
        userFriendlyMessage: msg`Option color must be a supported color`,
        value: color,
      },
    ];
  }

  return [];
};
