import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { type CustomException } from 'src/utils/custom-exception';

@Catch(ViewFilterGroupException)
export class ViewFilterGroupRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ViewFilterGroupException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA:
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
