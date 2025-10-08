import {
    type ArgumentsHost,
    Catch,
    type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
    ViewException,
    ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type CustomException } from 'src/utils/custom-exception';

@Catch(ViewException)
export class ViewRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ViewException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case ViewExceptionCode.VIEW_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case ViewExceptionCode.INVALID_VIEW_DATA:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          400,
        );
      default:
        // TODO: change to 500 when we have input validation
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          400,
        );
    }
  }
}
