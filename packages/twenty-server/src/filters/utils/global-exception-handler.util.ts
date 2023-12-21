import { HttpException } from '@nestjs/common';

import { TypeORMError } from 'typeorm';

import {
  AuthenticationError,
  BaseGraphQLError,
  ForbiddenError,
} from 'src/filters/utils/graphql-errors.util';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';

const graphQLPredefinedExceptions = {
  401: AuthenticationError,
  403: ForbiddenError,
};

export const globalExceptionHandler = (
  exception: unknown,
  exceptionHandlerService: ExceptionHandlerService,
) => {
  if (exception instanceof HttpException) {
    return httpExceptionHandler(exception, exceptionHandlerService);
  }

  if (exception instanceof TypeORMError) {
    return typeOrmExceptionHandler(exception, exceptionHandlerService);
  }

  exceptionHandlerService.captureException(exception);

  return exception;
};

export const httpExceptionHandler = (
  exception: HttpException,
  exceptionHandlerService: ExceptionHandlerService,
) => {
  const status = exception.getStatus();
  let error: BaseGraphQLError;

  // Capture all 5xx errors and send them to exception handler
  if (status >= 500) {
    exceptionHandlerService.captureException(exception);
  }

  if (status in graphQLPredefinedExceptions) {
    error = new graphQLPredefinedExceptions[exception.getStatus()](
      exception.message,
    );
  } else {
    error = new BaseGraphQLError(
      'Internal Server Error',
      exception.getStatus().toString(),
    );
  }

  error.stack = exception.stack;
  error.extensions['response'] = exception.getResponse();

  return error;
};

export const typeOrmExceptionHandler = (
  exception: TypeORMError,
  exceptionHandlerService: ExceptionHandlerService,
) => {
  exceptionHandlerService.captureException(exception);

  const error = new BaseGraphQLError(exception.name, 'INTERNAL_SERVER_ERROR');

  error.stack = exception.stack;
  error.extensions['response'] = exception.message;

  return error;
};
