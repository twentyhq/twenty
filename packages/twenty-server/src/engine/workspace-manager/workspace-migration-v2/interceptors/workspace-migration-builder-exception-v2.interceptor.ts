import { t } from '@lingui/core/macro';
import {
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';

import { GraphQLError } from 'graphql';
import { catchError, type Observable } from 'rxjs';

import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { fromWorkspaceMigrationBuilderExceptionToValidationResponseError } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-workspace-migration-builder-exception-to-validation-response-error.util';

export class WorkspaceMigrationBuilderExceptionV2Interceptor
  implements NestInterceptor
{
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        if (!(error instanceof WorkspaceMigrationBuilderExceptionV2)) {
          throw new error();
        }

        const { errors, summary } =
          fromWorkspaceMigrationBuilderExceptionToValidationResponseError(
            error,
          );

        throw new GraphQLError(`Workspace migration build validation failed`, {
          extensions: {
            code: 'METADATA_VALIDATION_ERROR',
            errors,
            summary,
            message: `Validation failed for ${summary.invalidObjects} object(s) and ${summary.invalidFields} field(s)`,
            userFriendlyMessage: t`Validation failed for ${summary.invalidObjects} object(s) and ${summary.invalidFields} field(s)`,
          },
        });
      }),
    );
  }
}
