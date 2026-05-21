import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { permissionRestApiExceptionCodeToHttpStatus } from 'src/engine/metadata-modules/permissions/utils/permission-rest-api-exception-code-to-http-status.util';
import { type CustomException } from 'src/utils/custom-exception';

@Injectable()
@Catch(PermissionsException)
export class PermissionsRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: PermissionsException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    return this.httpExceptionHandlerService.handleError(
      exception as CustomException,
      response,
      permissionRestApiExceptionCodeToHttpStatus(exception.code),
    );
  }
}
