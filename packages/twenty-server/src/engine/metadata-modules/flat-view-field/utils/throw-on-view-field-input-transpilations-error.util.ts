import {
  type SuccessfulViewFieldInputTranspilation,
  type ViewFieldInputTranspilationResult,
} from 'src/engine/metadata-modules/flat-view-field/types/view-field-input-transpilation-result.type';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-failure-report.constant';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';

// This could be improved by still running the build and validate with available valid inputs
type ThrowOnViewFieldInputTranspilationsErrorArgs = <T>(
  inputTranspilationResults: ViewFieldInputTranspilationResult<T>[],
  errorLabel: string,
) => asserts inputTranspilationResults is SuccessfulViewFieldInputTranspilation<T>[];

// TODO Centralize prastoin
export const throwOnViewFieldInputTranspilationsError: ThrowOnViewFieldInputTranspilationsErrorArgs =
  <T>(
    inputTranspilationResults: ViewFieldInputTranspilationResult<T>[],
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
            ...EMPTY_ORCHESTRATOR_FAILURE_REPORT(),
            viewField: [
              {
                errors: failedInputTranspilationErrors,
                type: 'create_view_field',
                flatEntityMinimalInformation: {},
              },
            ],
          },
          status: 'fail',
        },
        errorLabel,
      );
    }
  };

