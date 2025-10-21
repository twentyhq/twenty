import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import type { CustomException } from 'src/utils/custom-exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch(RouteTriggerException)
export class RouteTriggerRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: RouteTriggerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND:
      case RouteTriggerExceptionCode.ROUTE_NOT_FOUND:
      case RouteTriggerExceptionCode.TRIGGER_NOT_FOUND:
      case RouteTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          403,
        );
      case RouteTriggerExceptionCode.SERVERLESS_FUNCTION_EXECUTION_ERROR:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
        );
      case RouteTriggerExceptionCode.ROUTE_ALREADY_EXIST:
      case RouteTriggerExceptionCode.ROUTE_PATH_ALREADY_EXIST:
      default: {
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          400,
        );
      }
    }
  }
}
