import { type MessageDescriptor } from '@lingui/core';

import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';
import { fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/from-workspace-migration-builder-exception-to-metadata-validation-response-error.util';
import { getMetadataValidationUserFriendlyMessage } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/get-metadata-validation-user-friendly-message.util';

export type MetadataValidationErrorPayloadDescriptor =
  MetadataValidationErrorResponseDescriptor & {
    userFriendlyMessage: MessageDescriptor;
  };

export const buildMetadataValidationErrorPayload = (
  exception: WorkspaceMigrationBuilderException,
): MetadataValidationErrorPayloadDescriptor => {
  const { errors, summary } =
    fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError(
      exception,
    );

  const userFriendlyMessage = getMetadataValidationUserFriendlyMessage({
    errors,
    summary,
  });

  return {
    errors,
    summary,
    userFriendlyMessage,
  };
};
