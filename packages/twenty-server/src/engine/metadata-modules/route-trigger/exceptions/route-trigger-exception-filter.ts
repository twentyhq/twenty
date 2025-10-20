import {
  BadRequestException,
  type ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  type RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export class RouteTriggerExceptionFilter implements ExceptionFilter {
  catch(exception: RouteTriggerException) {
    switch (exception.code) {
      case RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND:
      case RouteTriggerExceptionCode.ROUTE_NOT_FOUND:
      case RouteTriggerExceptionCode.TRIGGER_NOT_FOUND:
      case RouteTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
        throw new NotFoundError(exception);
      case RouteTriggerExceptionCode.ROUTE_ALREADY_EXIST:
      case RouteTriggerExceptionCode.ROUTE_PATH_ALREADY_EXIST:
        throw new BadRequestException(exception);
      case RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION:
        throw new ForbiddenException(exception);
      case RouteTriggerExceptionCode.SERVERLESS_FUNCTION_EXECUTION_ERROR:
        throw new HttpException(exception, HttpStatus.INTERNAL_SERVER_ERROR);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
