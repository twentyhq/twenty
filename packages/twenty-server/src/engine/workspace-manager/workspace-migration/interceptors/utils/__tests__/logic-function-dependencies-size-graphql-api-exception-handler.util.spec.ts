import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { logicFunctionDependenciesSizeGraphqlApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/logic-function-dependencies-size-graphql-api-exception-handler.util';

describe('logicFunctionDependenciesSizeGraphqlApiExceptionHandler', () => {
  it('should throw a metadata validation error carrying one logicFunction entry', () => {
    const exception = new LogicFunctionException(
      "Dependency layer 'deps-abc' exceeds the Lambda layer size limit",
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
    );

    let thrown: BaseGraphQLError | undefined;

    try {
      logicFunctionDependenciesSizeGraphqlApiExceptionHandler(exception);
    } catch (error) {
      thrown = error as BaseGraphQLError;
    }

    expect(thrown).toBeInstanceOf(BaseGraphQLError);

    const extensions = thrown?.extensions as {
      summary: { totalErrors: number; logicFunction?: number };
      errors: {
        logicFunction?: {
          errors: { code: string; value?: unknown }[];
        }[];
      };
    };

    expect(extensions.summary).toEqual({ totalErrors: 1, logicFunction: 1 });
    expect(extensions.errors.logicFunction).toHaveLength(1);
    expect(extensions.errors.logicFunction?.[0].errors[0].code).toBe(
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
    );
    expect(extensions.errors.logicFunction?.[0].errors[0].value).toBe(
      exception.message,
    );
  });
});
