import { CustomException } from 'src/utils/custom-exception';

export class RouteTriggerException extends CustomException {
  code: RouteTriggerExceptionCode;
  constructor(message: string, code: RouteTriggerExceptionCode) {
    super(message, code);
  }
}

export enum RouteTriggerExceptionCode {
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  ROUTE_ALREADY_EXIST = 'ROUTE_ALREADY_EXIST',
  ROUTE_INVALID = 'ROUTE_INVALID',
  ROUTE_PATH_ALREADY_EXIST = 'ROUTE_PATH_ALREADY_EXIST',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
}
