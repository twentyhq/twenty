import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';

import {
  AuthenticationError,
  BaseGraphQLError,
  ForbiddenError,
} from 'src/filters/utils/graphql-errors.util';

const graphQLPredefinedExceptions = {
  401: AuthenticationError,
  403: ForbiddenError,
};

@Catch(HttpException)
export class HttpExceptionFilter
  implements GqlExceptionFilter<HttpException, BaseGraphQLError | null>
{
  catch(exception: HttpException, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() !== 'graphql') {
      return null;
    }

    let error: BaseGraphQLError;

    if (exception.getStatus() in graphQLPredefinedExceptions) {
      error = new graphQLPredefinedExceptions[exception.getStatus()](
        exception.message,
      );
    } else {
      error = new BaseGraphQLError(
        exception.message,
        exception.getStatus().toString(),
      );
    }

    error.stack = exception.stack;
    error.extensions['response'] = exception.getResponse();

    return error;
  }
}
