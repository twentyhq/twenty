import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';

export type MetadataValidationErrorPayloadDescriptor =
  MetadataValidationErrorResponseDescriptor & {
    userFriendlyMessage: MessageDescriptor;
  };

const MANY_VALIDATION_ERRORS_MESSAGE = msg`Many validation errors`;
const METADATA_VALIDATION_FAILED_MESSAGE = msg`Metadata validation failed`;

const getMetadataValidationUserFriendlyMessage = (
  metadataValidation: MetadataValidationErrorResponseDescriptor,
): MessageDescriptor => {
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

export const buildMetadataValidationErrorPayload = (
  exception: WorkspaceMigrationBuilderException,
): MetadataValidationErrorPayloadDescriptor => {
  const { report } = exception.failedWorkspaceMigrationBuildResult;

  const { errors, summary } = (
    Object.keys(report) as (keyof typeof report)[]
  ).reduce<MetadataValidationErrorResponseDescriptor>(
    (acc, metadataName) => {
      const failedMetadataValidation = report[metadataName];

      if (failedMetadataValidation.length === 0) {
        return acc;
      }

      return {
        errors: { ...acc.errors, [metadataName]: failedMetadataValidation },
        summary: {
          ...acc.summary,
          totalErrors:
            acc.summary.totalErrors + failedMetadataValidation.length,
          [metadataName]: failedMetadataValidation.length,
        },
      };
    },
    { errors: {}, summary: { totalErrors: 0 } },
  );

  return {
    errors,
    summary,
    userFriendlyMessage: getMetadataValidationUserFriendlyMessage({
      errors,
      summary,
    }),
  };
};
