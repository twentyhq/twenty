import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';

@Catch(PageLayoutException)
export class PageLayoutRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: PageLayoutException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
      default:
        // TODO: change to 500 when we have input validation
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
    }
  }
}
