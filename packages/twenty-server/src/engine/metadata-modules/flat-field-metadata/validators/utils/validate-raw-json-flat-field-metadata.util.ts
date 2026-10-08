import { msg } from '@lingui/core/macro';
import { isPlainObject } from 'twenty-shared/utils';
import { z } from 'zod';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateRawJsonFlatFieldMetadata = ({
  flatEntityToValidate,
}: {
  flatEntityToValidate: { universalSettings?: unknown };
}): FlatFieldMetadataValidationError[] => {
  const { universalSettings } = flatEntityToValidate;

  if (!isPlainObject(universalSettings)) {
    return [];
  }

  if (
    !z.boolean().optional().safeParse(universalSettings.isValueLoadedOnOpen)
      .success
  ) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'JSON field isValueLoadedOnOpen setting must be a boolean',
        userFriendlyMessage: msg`JSON field loading setting must be a boolean`,
      },
    ];
  }

  return [];
};
