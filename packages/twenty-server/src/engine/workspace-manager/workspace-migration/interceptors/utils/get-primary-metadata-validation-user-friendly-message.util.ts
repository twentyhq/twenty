import { isNonEmptyString } from '@sniptt/guards';
import {
  ALL_METADATA_NAME,
  type MetadataValidationErrorResponse,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export const getPrimaryMetadataValidationUserFriendlyMessage = (
  metadataValidation: MetadataValidationErrorResponse,
): string | undefined => {
  if (metadataValidation.summary.totalErrors !== 1) {
    return undefined;
  }

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    const failedValidations = metadataValidation.errors[metadataName];

    if (!isDefined(failedValidations) || failedValidations.length === 0) {
      continue;
    }

    for (const failedValidation of failedValidations) {
      for (const validationError of failedValidation.errors) {
        if (isNonEmptyString(validationError.userFriendlyMessage)) {
          return validationError.userFriendlyMessage;
        }
      }
    }
  }

  return undefined;
};
