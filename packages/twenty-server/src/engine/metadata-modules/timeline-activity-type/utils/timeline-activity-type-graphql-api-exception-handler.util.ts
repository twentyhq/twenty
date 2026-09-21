import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { TimelineActivityTypeException } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.exception';

export const timelineActivityTypeGraphqlApiExceptionHandler = (
  error: Error,
) => {
  if (error instanceof TimelineActivityTypeException) {
    switch (error.code) {
      case TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NOT_FOUND:
        throw new NotFoundError(error);
      case TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_CANNOT_BE_RESET:
      case TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS:
      case TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT:
        throw new UserInputError(error);
      default:
        return assertUnreachable(error.code);
    }
  }

  throw error;
};
