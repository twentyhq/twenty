import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  TimelineActivityRuleException,
  TimelineActivityRuleExceptionCode,
} from 'src/engine/metadata-modules/timeline-activity-rule/timeline-activity-rule.exception';

export const timelineActivityRuleGraphqlApiExceptionHandler = (
  error: Error,
) => {
  if (error instanceof TimelineActivityRuleException) {
    switch (error.code) {
      case TimelineActivityRuleExceptionCode.TIMELINE_ACTIVITY_RULE_NOT_FOUND:
        throw new NotFoundError(error);
      case TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT:
      case TimelineActivityRuleExceptionCode.UNSUPPORTED_RESOLUTION:
      case TimelineActivityRuleExceptionCode.INVALID_RELATION_FIELD:
        throw new UserInputError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
