import { isNonEmptyString } from '@sniptt/guards';
import {
  ALL_METADATA_NAME,
  type FailedMetadataValidationError,
  type MetadataValidationErrorResponse,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

const getUserFacingMessageForValidationError = (
  validationError: FailedMetadataValidationError,
): string | undefined => {
  if (isNonEmptyString(validationError.userFriendlyMessage)) {
    return validationError.userFriendlyMessage;
  }

  if (isNonEmptyString(validationError.message)) {
    return validationError.message;
  }

  return undefined;
};

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
        const message =
          getUserFacingMessageForValidationError(validationError);

        if (isDefined(message)) {
          return message;
        }
      }
    }
  }

  return undefined;
};
