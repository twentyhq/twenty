import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateTextFlatFieldMetadata = ({
  flatEntityToValidate,
}: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.TEXT>): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  const pattern = flatEntityToValidate?.universalSettings?.validationPattern;

  if (isNonEmptyString(pattern)) {
    try {
      new RegExp(pattern);
    } catch {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `validationPattern is not a valid regular expression: ${pattern}`,
        userFriendlyMessage: msg`The validation pattern is not a valid regular expression`,
      });
    }
  }

  return errors;
};
