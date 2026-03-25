import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';

@Catch(PageLayoutTabException)
export class PageLayoutTabRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: PageLayoutTabException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA:
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
