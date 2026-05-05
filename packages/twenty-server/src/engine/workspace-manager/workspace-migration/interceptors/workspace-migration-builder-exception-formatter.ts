import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { buildMetadataValidationErrorPayload } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/build-metadata-validation-error-payload.util';

export const workspaceMigrationBuilderExceptionFormatter = (
  error: WorkspaceMigrationBuilderException,
) => {
  const payload = buildMetadataValidationErrorPayload(error);

  const validationSummaryMessage = `Validation failed for ${Object.values(
    ALL_METADATA_NAME,
  )
    .flatMap((metadataName) => {
      const count = payload.summary[metadataName];

      if (!isDefined(count) || count === 0) {
        return [];
      }

      return [`${count} ${metadataName}${count > 1 ? 's' : ''}`];
    })
    .join(', ')}`;

  throw new BaseGraphQLError(
    error.message,
    ErrorCode.METADATA_VALIDATION_FAILED,
    {
      code: 'METADATA_VALIDATION_ERROR',
      ...payload,
      message: validationSummaryMessage,
    },
  );
};
