import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/from-workspace-migration-builder-exception-to-metadata-validation-response-error.util';

export const workspaceMigrationBuilderExceptionFormatter = (
  error: WorkspaceMigrationBuilderException,
  i18n: I18n,
) => {
  const { errors, summary } =
    fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError(
      error,
      i18n,
    );

  const message = `Validation failed for ${Object.values(ALL_METADATA_NAME)
    .flatMap((metadataName) => {
      const count = summary[metadataName];

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
      errors,
      summary,
      message,
      userFriendlyMessage: msg`Metadata validation failed`,
    },
  );
};
