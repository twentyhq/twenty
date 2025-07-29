import { CustomException } from 'src/utils/custom-exception';

export class ViewFilterException extends CustomException {
  declare code: ViewFilterExceptionCode;
  constructor(
    message: string,
    code: ViewFilterExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ViewFilterExceptionCode {
  VIEW_FILTER_NOT_FOUND = 'VIEW_FILTER_NOT_FOUND',
  INVALID_VIEW_FILTER_DATA = 'INVALID_VIEW_FILTER_DATA',
}
