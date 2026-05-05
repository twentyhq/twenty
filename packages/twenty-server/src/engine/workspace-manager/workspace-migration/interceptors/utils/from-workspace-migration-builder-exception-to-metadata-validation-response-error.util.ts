import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';

export const fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError =
  (
    workspaceMigrationBuilderException: WorkspaceMigrationBuilderException,
  ): MetadataValidationErrorResponseDescriptor => {
    const report =
      workspaceMigrationBuilderException.failedWorkspaceMigrationBuildResult
        .report;

    const initialAccumulator: MetadataValidationErrorResponseDescriptor = {
      errors: {},
      summary: {
        totalErrors: 0,
      },
    };

    return (Object.keys(report) as (keyof typeof report)[]).reduce(
      (acc, metadataName) => {
        const failedMetadataValidation = report[metadataName];

        if (failedMetadataValidation.length === 0) {
          return acc;
        }

        return {
          errors: {
            ...acc.errors,
            [metadataName]: failedMetadataValidation,
          },
          summary: {
            ...acc.summary,
            totalErrors:
              acc.summary.totalErrors + failedMetadataValidation.length,
            [metadataName]: failedMetadataValidation.length,
          },
        } satisfies MetadataValidationErrorResponseDescriptor;
      },
      initialAccumulator,
    );
  };
