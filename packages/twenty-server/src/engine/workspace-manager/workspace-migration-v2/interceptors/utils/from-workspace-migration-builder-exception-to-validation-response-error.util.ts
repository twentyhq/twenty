import { isFailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/utils/is-failed-flat-object-metadata-validation.util';
import { type WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { type ValidationErrorResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';
import { fromFailedFlatFieldMetadataValidationToValidationErrorFieldResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-failed-flat-field-metadata-validation-to-validation-error-field-response.util';
import { fromFailedFlatObjectMetadataValidationToValidationErrorObjectResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-failed-flat-object-metadata-validation-to-validation-error-object-response.util';

export const fromWorkspaceMigrationBuilderExceptionToValidationResponseError = (
  workspaceMigrationBuilderException: WorkspaceMigrationBuilderExceptionV2,
) => {
  const emptyResponseError: ValidationErrorResponse = {
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

  return workspaceMigrationBuilderException.failedWorkspaceMigrationBuildResult.errors.reduce<ValidationErrorResponse>(
    ({ errors, summary }, failedValidationError) => {
      if (isFailedFlatObjectMetadataValidation(failedValidationError)) {
        const errorObjectResponse =
          fromFailedFlatObjectMetadataValidationToValidationErrorObjectResponse(
            failedValidationError,
          );

        return {
          summary: {
            ...summary,
            invalidFields:
              summary.invalidFields + errorObjectResponse.fields.length,
            invalidObjects: ++summary.invalidObjects,
            totalErrors:
              ++summary.totalErrors + errorObjectResponse.fields.length,
          },
          errors: {
            ...errors,
            objectMetadata: [...errors.objectMetadata, errorObjectResponse],
          },
        };
      }

      const fieldResponseError =
        fromFailedFlatFieldMetadataValidationToValidationErrorFieldResponse(
          failedValidationError,
        );

      return {
        summary: {
          ...summary,
          invalidFields: ++summary.invalidFields,
          totalErrors: ++summary.totalErrors,
        },
        errors: {
          ...errors,
          fieldMetadata: [...errors.fieldMetadata, fieldResponseError],
        },
      };
    },
    emptyResponseError,
  );
};
