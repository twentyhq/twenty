import { type I18n } from '@lingui/core';
import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';

import { type WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { translateOrchestratorFailureReportErrors } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/translate-orchestrator-failure-report-errors.util';

export const fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError =
  (
    workspaceMigrationBuilderException: WorkspaceMigrationBuilderExceptionV2,
    i18n: I18n,
  ): MetadataValidationErrorResponse => {
    const translatedReport = translateOrchestratorFailureReportErrors(
      workspaceMigrationBuilderException.failedWorkspaceMigrationBuildResult
        .report,
      i18n,
    );

    return {
      summary: {
        invalidAgent: 0,
        invalidSkill: 0,
        invalidViewFilter: 0,
        invalidObjectMetadata: 0,
        invalidView: 0,
        invalidViewField: 0,
        invalidIndex: 0,
        invalidServerlessFunction: 0,
        invalidDatabaseEventTrigger: 0,
        invalidCronTrigger: 0,
        invalidRouteTrigger: 0,
        invalidFieldMetadata: 0,
        invalidViewGroup: 0,
        invalidRole: 0,
        invalidRoleTarget: 0,
        invalidPageLayout: 0,
        invalidPageLayoutWidget: 0,
        totalErrors: 0,
        invalidPageLayoutTab: 0,
      },
      errors: translatedReport,
    };
  };
