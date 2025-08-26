import { t } from '@lingui/core/macro';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { fromWorkspaceMigrationBuilderExceptionToValidationResponseError } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-workspace-migration-builder-exception-to-validation-response-error.util';

export const workspaceMigrationBuilderExceptionV2Handler = (error: Error) => {
  if (!(error instanceof WorkspaceMigrationBuilderExceptionV2)) {
    throw error;
  }

  const { errors, summary } =
    fromWorkspaceMigrationBuilderExceptionToValidationResponseError(error);

  throw new BaseGraphQLError(error.message, ErrorCode.BAD_USER_INPUT, {
    code: 'METADATA_VALIDATION_ERROR',
    errors,
    summary,
    message: `Validation failed for ${summary.invalidObjects} object(s) and ${summary.invalidFields} field(s)`,
    userFriendlyMessage: t`Validation failed for ${summary.invalidObjects} object(s) and ${summary.invalidFields} field(s)`,
  });
};
