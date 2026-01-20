import { msg } from '@lingui/core/macro';
import { FILES_FIELD_MAX_NUMBER_OF_VALUES } from 'twenty-shared/constants';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateFilesFlatFieldMetadata = ({
  flatEntityToValidate,
  additionalCacheDataMaps,
}: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.FILES>): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];
  const { featureFlagsMap } = additionalCacheDataMaps;

  if (featureFlagsMap[FeatureFlagKey.IS_FILES_FIELD_ENABLED] !== true) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Files field type is not supported',
      userFriendlyMessage: msg`Files field type is not supported`,
    });
  }

  if (flatEntityToValidate.isUnique === true) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Files field is not supported for unique fields',
      userFriendlyMessage: msg`Files field is not supported for unique fields`,
    });
  }

  if (
    !isDefined(flatEntityToValidate?.settings?.maxNumberOfValues) ||
    flatEntityToValidate.settings.maxNumberOfValues < 1 ||
    flatEntityToValidate.settings.maxNumberOfValues >
      FILES_FIELD_MAX_NUMBER_OF_VALUES
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `maxNumberOfValues must be defined in settings and be a number greater than 0 and less than or equal to ${FILES_FIELD_MAX_NUMBER_OF_VALUES}`,
      userFriendlyMessage: msg`maxNumberOfValues must be defined in settings and be a number greater than 0 and less than or equal to ${FILES_FIELD_MAX_NUMBER_OF_VALUES}`,
    });
  }

  return errors;
};
