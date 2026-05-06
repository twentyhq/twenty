import { type I18n } from '@lingui/core';
import { type Response } from 'express';

import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { buildMetadataValidationErrorPayload } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/build-metadata-validation-error-payload.util';
import { translateUserFriendlyMessageDescriptors } from 'src/engine/core-modules/i18n/utils/translate-user-friendly-message-descriptors.util';

export const workspaceMigrationBuilderRestApiExceptionHandler = ({
  exception,
  response,
  i18n,
}: {
  exception: WorkspaceMigrationBuilderException;
  response: Response;
  i18n: I18n;
}): Response => {
  const payload = translateUserFriendlyMessageDescriptors(
    buildMetadataValidationErrorPayload(exception),
    i18n,
  );

  return response.status(400).json({
    statusCode: 400,
    error: 'METADATA_VALIDATION_ERROR',
    message: exception.message || 'Validation failed',
    ...payload,
  });
};
