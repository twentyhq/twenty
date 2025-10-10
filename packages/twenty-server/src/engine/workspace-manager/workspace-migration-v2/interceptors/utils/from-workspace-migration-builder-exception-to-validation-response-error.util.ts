import { type I18n } from '@lingui/core';

import { type WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { type ValidationErrorResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';
import { translateOrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/translate-validation-errors.util';

export const fromWorkspaceMigrationBuilderExceptionToValidationResponseError = (
  workspaceMigrationBuilderException: WorkspaceMigrationBuilderExceptionV2,
  i18n: I18n,
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
      invalidRouteTrigger: 0,
      invalidFieldMetadata: 0,
      totalErrors: 0,
    },
    errors: {
      fieldMetadata: [],
      index: [],
      objectMetadata: [],
      view: [],
      viewField: [],
      serverlessFunction: [],
      databaseEventTrigger: [],
      cronTrigger: [],
      routeTrigger: [],
    },
  };

  const report =
    workspaceMigrationBuilderException.failedWorkspaceMigrationBuildResult
      .report;

  // Translate all MessageDescriptors in the report structure
  const translatedReport = translateOrchestratorFailureReport(report, i18n);

  return {
    ...emptyResponseError,
    errors: translatedReport,
  };
};
