import { t } from '@lingui/core/macro';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { METADATA_NAME_VALIDATORS } from 'src/engine/metadata-modules/utils/constants/metadata-name-flat-metadata-validators.constants';

export const validateFlatFieldMetadataName = (
  name: string,
): FlatFieldMetadataValidationError[] =>
  METADATA_NAME_VALIDATORS.flatMap(({ validator, message }) => {
    const isInvalid = validator(name);

    if (isInvalid) {
      return {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t(message),
        userFriendlyMessage: t(message),
        value: name,
      };
    }

    return [];
  });
