import { type MessageDescriptor } from '@lingui/core';

import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';
import { getMetadataValidationUserFriendlyMessage } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/get-metadata-validation-user-friendly-message.util';

export type MetadataValidationErrorPayloadDescriptor =
  MetadataValidationErrorResponseDescriptor & {
    userFriendlyMessage: MessageDescriptor;
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
