import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { logicFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/logic-function/utils/logic-function-graphql-api-exception-handler.utils';

describe('logicFunctionGraphQLApiExceptionHandler', () => {
  it('should map LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED to UserInputError', () => {
    expect(() =>
      logicFunctionGraphQLApiExceptionHandler(
        new LogicFunctionException(
          'dependencies too large',
          LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
        ),
      ),
    ).toThrow(UserInputError);
  });

  it('should map LOGIC_FUNCTION_NOT_FOUND to NotFoundError', () => {
    expect(() =>
      logicFunctionGraphQLApiExceptionHandler(
        new LogicFunctionException(
          'not found',
          LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        ),
      ),
    ).toThrow(NotFoundError);
  });

  it('should map LOGIC_FUNCTION_DISABLED to ForbiddenError', () => {
    expect(() =>
      logicFunctionGraphQLApiExceptionHandler(
        new LogicFunctionException(
          'disabled',
          LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
        ),
      ),
    ).toThrow(ForbiddenError);
  });

  it('should rethrow LOGIC_FUNCTION_LAYER_BUILD_FAILED unchanged', () => {
    const exception = new LogicFunctionException(
      'layer build failed',
      LogicFunctionExceptionCode.LOGIC_FUNCTION_LAYER_BUILD_FAILED,
    );

    expect(() => logicFunctionGraphQLApiExceptionHandler(exception)).toThrow(
      exception,
    );
  });

  it('should rethrow unknown errors unchanged', () => {
    const error = new Error('unrelated');

    expect(() => logicFunctionGraphQLApiExceptionHandler(error)).toThrow(error);
  });
});
