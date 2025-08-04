import { CustomException } from 'src/utils/custom-exception';

export class ViewException extends CustomException<ViewExceptionCode> {}

export enum ViewExceptionCode {
  CORE_VIEW_SYNC_ERROR = 'CORE_VIEW_SYNC_ERROR',
}
