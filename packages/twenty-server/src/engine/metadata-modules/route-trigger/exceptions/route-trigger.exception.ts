import { CustomException } from 'src/utils/custom-exception';

export class RouteTriggerException extends CustomException {
  code: RouteTriggerExceptionCode;
  constructor(message: string, code: RouteTriggerExceptionCode) {
    super(message, code);
  }
}

export enum RouteTriggerExceptionCode {
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  TRIGGER_NOT_FOUND = 'TRIGGER_NOT_FOUND',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
  ROUTE_ALREADY_EXIST = 'ROUTE_ALREADY_EXIST',
  ROUTE_PATH_ALREADY_EXIST = 'ROUTE_PATH_ALREADY_EXIST',
  FORBIDDEN_EXCEPTION = 'FORBIDDEN_EXCEPTION',
  SERVERLESS_FUNCTION_EXECUTION_ERROR = 'SERVERLESS_FUNCTION_EXECUTION_ERROR',
}
