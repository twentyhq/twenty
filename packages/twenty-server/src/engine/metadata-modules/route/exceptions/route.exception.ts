import { CustomException } from 'src/utils/custom-exception';

export class RouteException extends CustomException {
  code: RouteExceptionCode;
  constructor(message: string, code: RouteExceptionCode) {
    super(message, code);
  }
}

export enum RouteExceptionCode {
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  ROUTE_ALREADY_EXIST = 'ROUTE_ALREADY_EXIST',
  ROUTE_INVALID = 'ROUTE_INVALID',
  ROUTE_PATH_ALREADY_EXIST = 'ROUTE_PATH_ALREADY_EXIST',
}
