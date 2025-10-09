import { type I18n } from '@lingui/core';

import { type WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { type ValidationErrorResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';
import { translateValidationErrors } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/translate-validation-errors.util';

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

  // Translate all validation errors in-place
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translatedReport: Record<string, any> = {};

  for (const [key, items] of Object.entries(report)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translatedReport[key] = items.map((item: any) => ({
      ...item,
      errors: translateValidationErrors(item.errors, i18n),
      ...(item.fields && {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: item.fields.map((field: any) => ({
          ...field,
          errors: translateValidationErrors(field.errors, i18n),
        })),
      }),
    }));
  }

  return {
    ...emptyResponseError,
    errors: translatedReport as ValidationErrorResponse['errors'],
  };
};
