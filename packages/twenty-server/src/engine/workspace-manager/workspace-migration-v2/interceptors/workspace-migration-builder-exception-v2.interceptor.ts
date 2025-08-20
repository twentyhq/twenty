import { t } from '@lingui/core/macro';
import {
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
type ValidationErrorResponse = {
  summary: {
    totalErrors: number;
    invalidFields: number;
    invalidObjects: number;
  };
  errors: {
    objectMetadata: ValidationErrorObjectResponse[];
    fieldMetadata: ValidationErrorFieldResponse[];
  };
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

        const responseError: ValidationErrorResponse = {
          summary: {
            invalidFields: 0,
            invalidObjects: 0,
            totalErrors: 0,
          },
          errors: {
            fieldMetadata: [],
            objectMetadata: [],
          },
        };
        const formattedResponse =
          error.failedWorkspaceMigrationBuildResult.errors.reduce<ValidationErrorResponse>(
            (responseError, failedValidationError) => {
              if (failedValidationError.type === 'object') {
                const { id, namePlural, nameSingular } =
                  failedValidationError.objectMinimalInformation;
                const fields =
                  failedValidationError.fieldLevelErrors.map<ValidationErrorFieldResponse>(
                    ({
                      errors,
                      fieldMinimalInformation: { id, name, objectMetadataId },
                    }) => ({ id, name, objectMetadataId, errors }),
                  );
                const objectResponseError: ValidationErrorObjectResponse = {
                  fields,

                  id,
                  namePlural,
                  nameSingular,
                  errors: failedValidationError.objectLevelErrors,
                };
                return {
                  ...responseError,
                  summary: {
                    ...responseError.summary,
                    invalidFields:
                      responseError.summary.invalidFields + fields.length,
                    invalidObjects: ++responseError.summary.invalidObjects,
                    totalErrors:
                      responseError.summary.totalErrors + fields.length + 1,
                  },
                  errors: {
                    ...responseError.errors,
                    objectMetadata: [
                      ...responseError.errors.objectMetadata,
                      objectResponseError,
                    ],
                  },
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
                summary: {
                  ...responseError.summary,
                  invalidFields: ++responseError.summary.invalidFields,
                  totalErrors: ++responseError.summary.totalErrors,
                },
                errors: {
                  ...responseError.errors,
                  fieldMetadata: [
                    ...responseError.errors.fieldMetadata,
                    fieldResponseError,
                  ],
                },
              };
            },
            responseError,
          );

        throw new GraphQLError(`Workspace migration build validation failed`, {
          extensions: {
            code: 'METADATA_VALIDATION_ERROR',
            ...formattedResponse,
            message: `Validation failed for ${formattedResponse.summary.invalidObjects} object(s) and ${formattedResponse.summary.invalidFields} field(s)`,
            userFriendlyMessage: t`Validation failed for ${formattedResponse.summary.invalidObjects} object(s) and ${formattedResponse.summary.invalidFields} field(s)`,
          },
        });
      }),
    );
  }
}
