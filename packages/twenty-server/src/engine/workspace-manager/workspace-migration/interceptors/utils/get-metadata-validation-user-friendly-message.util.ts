import { msg } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';

const MANY_VALIDATION_ERRORS_MESSAGE = msg`Many validation errors`;
const METADATA_VALIDATION_FAILED_MESSAGE = msg`Metadata validation failed`;

export const getMetadataValidationUserFriendlyMessage = (
  metadataValidation: MetadataValidationErrorResponseDescriptor,
) => {
  if (metadataValidation.summary.totalErrors > 1) {
    return MANY_VALIDATION_ERRORS_MESSAGE;
  }

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    const failedValidations = metadataValidation.errors[metadataName];

    if (!isDefined(failedValidations) || failedValidations.length === 0) {
      continue;
    }

    for (const failedValidation of failedValidations) {
      for (const validationError of failedValidation.errors) {
        if (isDefined(validationError.userFriendlyMessage)) {
          return validationError.userFriendlyMessage;
        }
      }
    }
  }

  return METADATA_VALIDATION_FAILED_MESSAGE;
};
