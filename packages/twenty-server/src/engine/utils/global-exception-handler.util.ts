import { HttpException } from '@nestjs/common';

import { ExceptionHandlerUser } from 'src/engine/integrations/exception-handler/interfaces/exception-handler-user.interface';

import {
  AuthenticationError,
  BaseGraphQLError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from 'src/engine/utils/graphql-errors.util';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';

const graphQLPredefinedExceptions = {
  400: ValidationError,
  401: AuthenticationError,
  403: ForbiddenError,
  404: NotFoundError,
  409: ConflictError,
};

export const handleExceptionAndConvertToGraphQLError = (
  exception: Error,
  exceptionHandlerService: ExceptionHandlerService,
  user?: ExceptionHandlerUser,
): BaseGraphQLError => {
  handleException(exception, exceptionHandlerService, user);

  return convertExceptionToGraphQLError(exception);
};

export const filterException = (exception: Error): boolean => {
  if (exception instanceof HttpException && exception.getStatus() < 500) {
    return true;
  }

  return false;
};

export const handleException = (
  exception: Error,
  exceptionHandlerService: ExceptionHandlerService,
  user?: ExceptionHandlerUser,
): void => {
  if (filterException(exception)) {
    return;
  }

  exceptionHandlerService.captureExceptions([exception], { user });
};

export const convertExceptionToGraphQLError = (
  exception: Error,
): BaseGraphQLError => {
  if (exception instanceof HttpException) {
    return convertHttpExceptionToGraphql(exception);
  }

  return convertExceptionToGraphql(exception);
};

export const convertHttpExceptionToGraphql = (exception: HttpException) => {
  const status = exception.getStatus();
  let error: BaseGraphQLError;

  if (status in graphQLPredefinedExceptions) {
    const message = exception.getResponse()['message'] ?? exception.message;

    error = new graphQLPredefinedExceptions[exception.getStatus()](message);
  } else {
    error = new BaseGraphQLError(
      'Internal Server Error',
      exception.getStatus().toString(),
    );
  }

  // Only show the stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    error.stack = exception.stack;
    error.extensions['response'] = exception.getResponse();
  }

  return error;
};

export const convertExceptionToGraphql = (exception: Error) => {
  const error = new BaseGraphQLError(exception.name, 'INTERNAL_SERVER_ERROR');

  error.stack = exception.stack;
  error.extensions['response'] = exception.message;

  return error;
};
