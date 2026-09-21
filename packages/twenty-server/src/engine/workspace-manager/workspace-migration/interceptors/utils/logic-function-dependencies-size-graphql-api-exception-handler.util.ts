import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type LogicFunctionException } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';

export const logicFunctionDependenciesSizeGraphqlApiExceptionHandler = (
  exception: LogicFunctionException,
) => {
  const payload: MetadataValidationErrorResponseDescriptor = {
    summary: { totalErrors: 1, logicFunction: 1 },
    errors: {
      logicFunction: [
        {
          type: 'update',
          metadataName: 'logicFunction',
          errors: [
            {
              code: exception.code,
              message:
                'Production dependencies are too large to install. Move packages that are not imported by your logic functions (UI libraries, dev tooling) out of "dependencies".',
              userFriendlyMessage: exception.userFriendlyMessage,
              value: exception.message,
            },
          ],
          flatEntityMinimalInformation: {},
        },
      ],
    },
  };

  throw new BaseGraphQLError(
    exception.message,
    ErrorCode.METADATA_VALIDATION_FAILED,
    {
      code: 'METADATA_VALIDATION_ERROR',
      ...payload,
      userFriendlyMessage: exception.userFriendlyMessage,
      message: 'Validation failed for 1 logicFunction',
    },
  );
};
