import { MultipleMetadataValidationErrors } from 'src/engine/core-modules/error/multiple-metadata-validation-errors';
import {
  type FieldInputTranspilationResult,
  type SuccessfulFieldInputTranspilation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';

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
      throw new MultipleMetadataValidationErrors(
        failedInputTranspilationErrors,
        errorLabel,
      );
    }
  };
