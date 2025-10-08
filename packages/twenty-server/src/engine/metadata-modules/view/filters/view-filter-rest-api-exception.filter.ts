import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view-filter.exception';
import { type CustomException } from 'src/utils/custom-exception';

@Catch(ViewFilterException)
export class ViewFilterRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ViewFilterException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA:
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
