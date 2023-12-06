import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';

import { TypeORMError } from 'typeorm';

import {
  AuthenticationError,
  BaseGraphQLError,
  ForbiddenError,
} from 'src/filters/utils/graphql-errors.util';

const graphQLPredefinedExceptions = {
  401: AuthenticationError,
  403: ForbiddenError,
};

@Catch()
export class ExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException | TypeORMError, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() !== 'graphql') {
      return null;
    }

    if (exception instanceof TypeORMError) {
      const error = new BaseGraphQLError(
        exception.name,
        'INTERNAL_SERVER_ERROR',
      );

      error.stack = exception.stack;
      error.extensions['response'] = exception.message;

      return error;
    } else if (exception instanceof HttpException) {
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

    return exception;
  }
}
