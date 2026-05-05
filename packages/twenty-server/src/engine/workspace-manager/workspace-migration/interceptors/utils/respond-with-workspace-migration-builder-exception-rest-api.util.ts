import { type I18n } from '@lingui/core';
import { type Response } from 'express';

import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/from-workspace-migration-builder-exception-to-metadata-validation-response-error.util';
import { translateMetadataValidationErrorResponse } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/translate-metadata-validation-error-response.util';

export const respondWithWorkspaceMigrationBuilderExceptionRestApi = ({
  exception,
  response,
  i18n,
}: {
  exception: WorkspaceMigrationBuilderException;
  response: Response;
  i18n: I18n;
}): Response => {
  const { errors, summary } = translateMetadataValidationErrorResponse(
    fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError(
      exception,
    ),
    i18n,
  );

  return response.status(400).json({
    statusCode: 400,
    error: 'METADATA_VALIDATION_ERROR',
    message: exception.message || 'Validation failed',
    errors,
    summary,
  });
};
