import { CustomException } from 'src/utils/custom-exception';

export class ViewException extends CustomException {
  constructor(message: string, code: ViewExceptionCode) {
    super(message, code);
  }
}

export enum ViewExceptionCode {
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  CANNOT_DELETE_INDEX_VIEW = 'CANNOT_DELETE_INDEX_VIEW',
  METHOD_NOT_IMPLEMENTED = 'METHOD_NOT_IMPLEMENTED',
  CORE_VIEW_SYNC_ERROR = 'CORE_VIEW_SYNC_ERROR',
}

export enum ViewExceptionMessage {
  VIEW_NOT_FOUND = 'View not found',
  CANNOT_DELETE_INDEX_VIEW = 'Cannot delete index view',
  METHOD_NOT_IMPLEMENTED = 'Method not implemented',
  CORE_VIEW_SYNC_ERROR = 'Failed to sync view data to core',
}
