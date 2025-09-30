import {
  type FieldInputTranspilationResult,
  type SuccessfulFieldInputTranspilation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';

// This could be improved by still running the build and validate with available valid inputs
type ThrowOnFieldInputTranspilationsErrorArgs = <T>(
  inputTranspilationResults: FieldInputTranspilationResult<T>[],
  errorLabel: string,
) => asserts inputTranspilationResults is SuccessfulFieldInputTranspilation<T>[];
export const throwOnFieldInputTranspilationsError: ThrowOnFieldInputTranspilationsErrorArgs =
  <T>(
    inputTranspilationResults: FieldInputTranspilationResult<T>[],
    errorLabel: string,
  ) => {
    const failedInputTranspilationErrors = inputTranspilationResults.flatMap(
      (transpilationResult) =>
        transpilationResult.status === 'fail' ? transpilationResult.error : [],
    );

    if (failedInputTranspilationErrors.length > 0) {
      // We should create a dedicated exceptions instead of hacking through the WorkspaceMigrationBuilderExceptionV2
      throw new WorkspaceMigrationBuilderExceptionV2(
        {
          report: {
            index: [],
            view: [],
            viewField: [],
            objectMetadata: [
              {
                errors: failedInputTranspilationErrors,
                type: 'create_field',
                flatEntityMinimalInformation: {},
              },
            ],
            serverlessFunction: [],
            databaseEventTrigger: [],
            cronTrigger: [],
          },
          status: 'fail',
        },
        errorLabel,
      );
    }
  };
