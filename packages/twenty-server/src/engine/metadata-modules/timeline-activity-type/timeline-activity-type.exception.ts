import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { CustomException } from 'src/utils/custom-exception';

const getTimelineActivityTypeExceptionUserFriendlyMessage = (
  code: TimelineActivityTypeExceptionCode,
) => {
  switch (code) {
    case TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NOT_FOUND:
      return msg`Timeline activity type not found.`;
    case TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_CANNOT_BE_RESET:
      return msg`Custom timeline activity type cannot be reset to default.`;
    case TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS:
      return msg`Timeline activity type name already exists.`;
    case TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT:
      return msg`Invalid timeline activity type input.`;
    default:
      assertUnreachable(code);
  }
};

export class TimelineActivityTypeException extends CustomException<TimelineActivityTypeExceptionCode> {
  constructor(
    message: string,
    code: TimelineActivityTypeExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getTimelineActivityTypeExceptionUserFriendlyMessage(code),
    });
  }
}
