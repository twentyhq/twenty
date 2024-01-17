import { HttpException } from '@nestjs/common';

import {
  AuthenticationError,
  BaseGraphQLError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from 'src/filters/utils/graphql-errors.util';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';

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
): BaseGraphQLError => {
  handleException(exception, exceptionHandlerService);

  return convertExceptionToGraphQLError(exception);
};

export const handleException = (
  exception: Error,
  exceptionHandlerService: ExceptionHandlerService,
): void => {
  if (exception instanceof HttpException && exception.getStatus() < 500) {
    return;
  }
  exceptionHandlerService.captureException(exception);
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

export const convertExceptionToGraphql = (exception: Error) => {
  const error = new BaseGraphQLError(exception.name, 'INTERNAL_SERVER_ERROR');

  error.stack = exception.stack;
  error.extensions['response'] = exception.message;

  return error;
};
