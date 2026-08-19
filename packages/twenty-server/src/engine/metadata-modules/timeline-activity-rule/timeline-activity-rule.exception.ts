import { assertUnreachable } from 'twenty-shared/utils';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum TimelineActivityRuleExceptionCode {
  TIMELINE_ACTIVITY_RULE_NOT_FOUND = 'TIMELINE_ACTIVITY_RULE_NOT_FOUND',
  INVALID_TIMELINE_ACTIVITY_RULE_INPUT = 'INVALID_TIMELINE_ACTIVITY_RULE_INPUT',
  UNSUPPORTED_RESOLUTION = 'UNSUPPORTED_RESOLUTION',
  INVALID_RELATION_FIELD = 'INVALID_RELATION_FIELD',
}

const getTimelineActivityRuleExceptionUserFriendlyMessage = (
  code: TimelineActivityRuleExceptionCode,
) => {
  switch (code) {
    case TimelineActivityRuleExceptionCode.TIMELINE_ACTIVITY_RULE_NOT_FOUND:
      return msg`Timeline rule not found.`;
    case TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT:
      return msg`Invalid timeline rule input.`;
    case TimelineActivityRuleExceptionCode.UNSUPPORTED_RESOLUTION:
      return msg`This timeline rule resolution is not supported yet.`;
    case TimelineActivityRuleExceptionCode.INVALID_RELATION_FIELD:
      return msg`This relation cannot drive a timeline rule.`;
    default:
      assertUnreachable(code);
  }
};

export class TimelineActivityRuleException extends CustomException<TimelineActivityRuleExceptionCode> {
  constructor(message: string, code: TimelineActivityRuleExceptionCode) {
    super(message, code, {
      userFriendlyMessage:
        getTimelineActivityRuleExceptionUserFriendlyMessage(code),
    });
  }
}
