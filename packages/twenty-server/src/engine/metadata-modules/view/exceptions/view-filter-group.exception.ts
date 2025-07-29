import { CustomException } from 'src/utils/custom-exception';

export class ViewFilterGroupException extends CustomException {
  declare code: ViewFilterGroupExceptionCode;
  constructor(
    message: string,
    code: ViewFilterGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ViewFilterGroupExceptionCode {
  VIEW_FILTER_GROUP_NOT_FOUND = 'VIEW_FILTER_GROUP_NOT_FOUND',
  INVALID_VIEW_FILTER_GROUP_DATA = 'INVALID_VIEW_FILTER_GROUP_DATA',
}
