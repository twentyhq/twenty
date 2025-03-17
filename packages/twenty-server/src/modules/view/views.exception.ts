import { ViewExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class ViewException extends CustomException {
  constructor(message: string, code: ViewExceptionCode) {
    super(message, code);
  }
}

export enum ViewExceptionMessage {
  VIEW_NOT_FOUND = 'View not found',
  CANNOT_DELETE_INDEX_VIEW = 'Cannot delete index view',
  METHOD_NOT_IMPLEMENTED = 'Method not implemented',
}
