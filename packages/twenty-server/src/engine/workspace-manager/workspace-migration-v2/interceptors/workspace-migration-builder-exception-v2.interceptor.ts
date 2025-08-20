import {
  HttpStatus,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';

import { GraphQLError } from 'graphql';
import { catchError, type Observable } from 'rxjs';
import { FieldMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-field-metadata/types/field-metadata-minimal-information.type';
import { FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';

type ValidationErrorFieldResponse = Partial<FieldMetadataMinimalInformation> & {
  errors: FlatFieldMetadataValidationError[];
};
type ValidationErrorObjectResponse =
  Partial<ObjectMetadataMinimalInformation> & {
    errors: FlatObjectMetadataValidationError[];
    fields: ValidationErrorFieldResponse[];
  };
export class WorkspaceMigrationBuilderExceptionV2Interceptor
  implements NestInterceptor
{
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        if (!(error instanceof WorkspaceMigrationBuilderExceptionV2)) {
          throw new error();
        }

        const responseError: {
          objectMetadata: ValidationErrorObjectResponse[];
          fieldMetadata: ValidationErrorFieldResponse[];
        } = {
          fieldMetadata: [],
          objectMetadata: [],
        };
        const formattedResponse =
          error.failedWorkspaceMigrationBuildResult.errors.reduce(
            (responseError, failedValidationError) => {
              if (failedValidationError.type === 'object') {
                const { id, namePlural, nameSingular } =
                  failedValidationError.objectMinimalInformation;
                const objectResponseError: ValidationErrorObjectResponse = {
                  fields:
                    failedValidationError.fieldLevelErrors.map<ValidationErrorFieldResponse>(
                      ({
                        errors,
                        fieldMinimalInformation: { id, name, objectMetadataId },
                      }) => ({ id, name, objectMetadataId, errors }),
                    ),
                  id,
                  namePlural,
                  nameSingular,
                  errors: failedValidationError.objectLevelErrors,
                };
                return {
                  ...responseError,
                  objectMetadata: [
                    ...responseError.objectMetadata,
                    objectResponseError,
                  ],
                };
              }

              const { id, name, objectMetadataId } =
                failedValidationError.fieldMinimalInformation;
              const fieldResponseError: ValidationErrorFieldResponse = {
                id,
                name,
                errors: failedValidationError.errors,
                objectMetadataId,
              };
              return {
                ...responseError,
                fieldMetadata: [
                  ...responseError.fieldMetadata,
                  fieldResponseError,
                ],
              };
            },
            responseError,
          );

        throw new GraphQLError('Workspace migration build validation failed', {
          extensions: {
            code: HttpStatus.BAD_REQUEST,
            userFriendlyMessage: 'Workspace migration build validation failed',
            errors: formattedResponse,
          },
        });
      }),
    );
  }
}
