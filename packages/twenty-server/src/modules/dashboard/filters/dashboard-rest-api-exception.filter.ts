import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';
import { assertUnreachable } from 'twenty-shared/utils';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  DashboardException,
  DashboardExceptionCode,
} from 'src/modules/dashboard/exceptions/dashboard.exception';
import { type CustomException } from 'src/utils/custom-exception';

@Injectable()
@Catch(DashboardException)
export class DashboardRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: DashboardException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case DashboardExceptionCode.DASHBOARD_NOT_FOUND:
      case DashboardExceptionCode.PAGE_LAYOUT_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case DashboardExceptionCode.DASHBOARD_DUPLICATION_FAILED:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
        );
      default:
        assertUnreachable(exception.code);
    }
  }
}
