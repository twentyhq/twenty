import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { fromWorkspaceMigrationBuilderExceptionToValidationResponseError } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-workspace-migration-builder-exception-to-validation-response-error.util';

export const workspaceMigrationBuilderExceptionV2Formatter = (
  error: WorkspaceMigrationBuilderExceptionV2,
  i18n: I18n,
) => {
  const { errors, summary } =
    fromWorkspaceMigrationBuilderExceptionToValidationResponseError(
      error,
      i18n,
    );

  throw new BaseGraphQLError(error.message, ErrorCode.BAD_USER_INPUT, {
    code: 'METADATA_VALIDATION_ERROR',
    errors,
    summary,
    message: `Validation failed for 0 object(s) and 0 field(s)`,
    userFriendlyMessage: msg`Validation failed for 0 object(s) and 0 field(s)`,
  });
};
