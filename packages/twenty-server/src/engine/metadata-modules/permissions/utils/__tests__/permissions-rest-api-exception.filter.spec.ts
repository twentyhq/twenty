import { type ArgumentsHost } from '@nestjs/common';

import { type Response } from 'express';

import { type HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

describe('PermissionsRestApiExceptionFilter', () => {
  const handleError = jest.fn();
  const response = {} as Response;

  const httpExceptionHandlerService = {
    handleError,
  } as unknown as HttpExceptionHandlerService;

  const filter = new PermissionsRestApiExceptionFilter(
    httpExceptionHandlerService,
  );

  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 for PERMISSION_DENIED', () => {
    const exception = new PermissionsException(
      'Entity performing the request does not have permission',
      PermissionsExceptionCode.PERMISSION_DENIED,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 403);
  });

  it('should return 403 for NO_AUTHENTICATION_CONTEXT', () => {
    const exception = new PermissionsException(
      'No authentication context',
      PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 403);
  });

  it('should return 404 for ROLE_NOT_FOUND', () => {
    const exception = new PermissionsException(
      'Role not found',
      PermissionsExceptionCode.ROLE_NOT_FOUND,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 404);
  });

  it('should return 400 for INVALID_ARG', () => {
    const exception = new PermissionsException(
      'Invalid argument',
      PermissionsExceptionCode.INVALID_ARG,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 400);
  });
});
