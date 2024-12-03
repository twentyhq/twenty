import { HttpException } from '@nestjs/common';

import { GraphQLError } from 'graphql';

import { ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';
import { ExceptionHandlerWorkspace } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-workspace.interface';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  AuthenticationError,
  BaseGraphQLError,
  ConflictError,
  ErrorCode,
  ForbiddenError,
  MethodNotAllowedError,
  NotFoundError,
  TimeoutError,
  ValidationError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const graphQLPredefinedExceptions = {
  400: ValidationError,
  401: AuthenticationError,
  403: ForbiddenError,
  404: NotFoundError,
  405: MethodNotAllowedError,
  408: TimeoutError,
  409: ConflictError,
};

export const graphQLErrorCodesToFilter = [
  ErrorCode.GRAPHQL_VALIDATION_FAILED,
  ErrorCode.UNAUTHENTICATED,
  ErrorCode.FORBIDDEN,
  ErrorCode.NOT_FOUND,
  ErrorCode.METHOD_NOT_ALLOWED,
  ErrorCode.TIMEOUT,
  ErrorCode.CONFLICT,
  ErrorCode.BAD_USER_INPUT,
];

export const handleExceptionAndConvertToGraphQLError = (
  exception: Error,
  exceptionHandlerService: ExceptionHandlerService,
  user?: ExceptionHandlerUser,
  workspace?: ExceptionHandlerWorkspace,
): BaseGraphQLError => {
  handleException(exception, exceptionHandlerService, user, workspace);

  return convertExceptionToGraphQLError(exception);
};

export const shouldFilterException = (exception: Error): boolean => {
  if (
    exception instanceof GraphQLError &&
    (exception?.extensions?.http?.status ?? 500) < 500
  ) {
    return true;
  }

  if (
    exception instanceof BaseGraphQLError &&
    graphQLErrorCodesToFilter.includes(exception?.extensions?.code)
  ) {
    return true;
  }

  if (exception instanceof HttpException && exception.getStatus() < 500) {
    return true;
  }

  return false;
};

const handleException = (
  exception: Error,
  exceptionHandlerService: ExceptionHandlerService,
  user?: ExceptionHandlerUser,
  workspace?: ExceptionHandlerWorkspace,
): void => {
  if (shouldFilterException(exception)) {
    return;
  }

  exceptionHandlerService.captureExceptions([exception], { user, workspace });
};

export const convertExceptionToGraphQLError = (
  exception: Error,
): BaseGraphQLError => {
  if (exception instanceof HttpException) {
    return convertHttpExceptionToGraphql(exception);
  }
  if (exception instanceof BaseGraphQLError) {
    return exception;
  }

  return convertExceptionToGraphql(exception);
};

const convertHttpExceptionToGraphql = (exception: HttpException) => {
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
  const error = new BaseGraphQLError(
    exception.name,
    ErrorCode.INTERNAL_SERVER_ERROR,
  );

  error.stack = exception.stack;
  error.extensions['response'] = exception.message;

  return error;
};
