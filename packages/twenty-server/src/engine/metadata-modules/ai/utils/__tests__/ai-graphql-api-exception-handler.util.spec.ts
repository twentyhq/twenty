import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { aiGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/utils/ai-graphql-api-exception-handler.util';
import {
  ErrorCode,
  type BaseGraphQLError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const catchGraphqlError = (error: Error): BaseGraphQLError => {
  try {
    aiGraphqlApiExceptionHandler(error);
    throw new Error('Expected aiGraphqlApiExceptionHandler to throw');
  } catch (graphqlError) {
    return graphqlError as BaseGraphQLError;
  }
};

describe('aiGraphqlApiExceptionHandler', () => {
  it('maps API key configuration failures to INTERNAL_SERVER_ERROR with a subCode', () => {
    const error = new AiException(
      'No AI models are available',
      AiExceptionCode.API_KEY_NOT_CONFIGURED,
    );

    const graphqlError = catchGraphqlError(error);

    expect(graphqlError.extensions.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(graphqlError.extensions.subCode).toBe(
      AiExceptionCode.API_KEY_NOT_CONFIGURED,
    );
    expect(graphqlError.extensions.userFriendlyMessage).toBeDefined();
  });

  it('maps THREAD_NOT_FOUND to NOT_FOUND', () => {
    const error = new AiException(
      'Thread not found',
      AiExceptionCode.THREAD_NOT_FOUND,
    );

    const graphqlError = catchGraphqlError(error);

    expect(graphqlError.extensions.code).toBe(ErrorCode.NOT_FOUND);
    expect(graphqlError.extensions.subCode).toBe(
      AiExceptionCode.THREAD_NOT_FOUND,
    );
  });

  it('maps MESSAGE_NOT_FOUND to NOT_FOUND', () => {
    const error = new AiException(
      'Message not found',
      AiExceptionCode.MESSAGE_NOT_FOUND,
    );

    const graphqlError = catchGraphqlError(error);

    expect(graphqlError.extensions.code).toBe(ErrorCode.NOT_FOUND);
    expect(graphqlError.extensions.subCode).toBe(
      AiExceptionCode.MESSAGE_NOT_FOUND,
    );
  });
});
