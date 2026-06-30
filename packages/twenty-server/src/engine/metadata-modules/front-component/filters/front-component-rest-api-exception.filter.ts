import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

@Catch(FrontComponentException)
@Injectable()
export class FrontComponentRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: FrontComponentException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND:
      case FrontComponentExceptionCode.FRONT_COMPONENT_NOT_READY:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED:
      case FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
      case FrontComponentExceptionCode.FRONT_COMPONENT_ALREADY_EXISTS:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          409,
        );
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}
