import { type I18n } from '@lingui/core';
import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';

import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { translateOrchestratorFailureReportErrors } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/translate-orchestrator-failure-report-errors.util';

export const fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError =
  (
    workspaceMigrationBuilderException: WorkspaceMigrationBuilderException,
    i18n: I18n,
  ): MetadataValidationErrorResponse => {
    const translatedReport = translateOrchestratorFailureReportErrors(
      workspaceMigrationBuilderException.failedWorkspaceMigrationBuildResult
        .report,
      i18n,
    );

    const initialAccumulator: MetadataValidationErrorResponse = {
      errors: {},
      summary: {
        totalErrors: 0,
      },
    };

    return (
      Object.keys(translatedReport) as (keyof typeof translatedReport)[]
    ).reduce((acc, metadataName) => {
      const failedMetadataValidation = translatedReport[metadataName];

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
      } satisfies MetadataValidationErrorResponse;
    }, initialAccumulator);
  };
