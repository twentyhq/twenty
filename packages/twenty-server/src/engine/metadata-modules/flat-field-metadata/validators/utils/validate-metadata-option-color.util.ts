import { msg } from '@lingui/core/macro';
import { type TagColor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

const OPTION_COLOR_SCHEMA = z.enum([
  'red',
  'ruby',
  'crimson',
  'tomato',
  'orange',
  'amber',
  'yellow',
  'lime',
  'grass',
  'green',
  'jade',
  'mint',
  'turquoise',
  'cyan',
  'sky',
  'blue',
  'iris',
  'violet',
  'purple',
  'plum',
  'pink',
  'bronze',
  'gold',
  'brown',
  'gray',
] as const satisfies TagColor[]);

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
