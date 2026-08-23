import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum TimelineExceptionCode {
  TIMELINE_ACTIVITY_TYPE_RESOLUTION_FAILED = 'TIMELINE_ACTIVITY_TYPE_RESOLUTION_FAILED',
}

export class TimelineException extends CustomException<TimelineExceptionCode> {
  constructor(message: string) {
    super(
      message,
      TimelineExceptionCode.TIMELINE_ACTIVITY_TYPE_RESOLUTION_FAILED,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
