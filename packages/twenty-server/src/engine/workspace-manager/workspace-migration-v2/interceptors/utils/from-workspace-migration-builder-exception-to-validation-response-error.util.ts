import { type WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { type ValidationErrorResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';

export const fromWorkspaceMigrationBuilderExceptionToValidationResponseError = (
  workspaceMigrationBuilderException: WorkspaceMigrationBuilderExceptionV2,
): ValidationErrorResponse => {
  const emptyResponseError: ValidationErrorResponse = {
    summary: {
      invalidObjectMetadatas: 0,
      invalidViews: 0,
      invalidViewFields: 0,
      totalErrors: 0,
    },
    errors: {
      objectMetadata: [],
      view: [],
      viewField: [],
    },
  };

  return {
    ...emptyResponseError,
    errors:
      workspaceMigrationBuilderException.failedWorkspaceMigrationBuildResult
        .report,
  };
};
