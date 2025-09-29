import { type WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { type ValidationErrorResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';

export const fromWorkspaceMigrationBuilderExceptionToValidationResponseError = (
  workspaceMigrationBuilderException: WorkspaceMigrationBuilderExceptionV2,
): ValidationErrorResponse => {
  const emptyResponseError: ValidationErrorResponse = {
    summary: {
      invalidObjectMetadata: 0,
      invalidView: 0,
      invalidViewField: 0,
      invalidIndex: 0,
      invalidServerlessFunction: 0,
      invalidDatabaseEventTrigger: 0,
      invalidCronTrigger: 0,
      totalErrors: 0,
    },
    errors: {
      index: [],
      objectMetadata: [],
      view: [],
      viewField: [],
      serverlessFunction: [],
      databaseEventTrigger: [],
      cronTrigger: [],
    },
  };

  return {
    ...emptyResponseError,
    errors:
      workspaceMigrationBuilderException.failedWorkspaceMigrationBuildResult
        .report,
  };
};
