import {
  type FieldInputTranspilationResult,
  type SuccessfulFieldInputTranspilation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-failure-report.constant';
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
        transpilationResult.status === 'fail' ? transpilationResult.errors : [],
    );

    if (failedInputTranspilationErrors.length > 0) {
      // We should create a dedicated exceptions instead of hacking through the WorkspaceMigrationBuilderExceptionV2
      throw new WorkspaceMigrationBuilderExceptionV2(
        {
          report: {
            ...EMPTY_ORCHESTRATOR_FAILURE_REPORT(),
            fieldMetadata: [
              {
                errors: failedInputTranspilationErrors,
                type: 'create',
                metadataName: 'fieldMetadata',
                flatEntityMinimalInformation: {
                  id: '',
                },
              },
            ],
          },
          status: 'fail',
        },
        errorLabel,
      );
    }
  };
