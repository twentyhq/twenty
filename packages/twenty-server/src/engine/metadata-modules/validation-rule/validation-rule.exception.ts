import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ValidationRuleExceptionCode {
  VALIDATION_RULE_NOT_FOUND = 'VALIDATION_RULE_NOT_FOUND',
  INVALID_VALIDATION_RULE_INPUT = 'INVALID_VALIDATION_RULE_INPUT',
  INVALID_VALIDATION_RULE_EXPRESSION = 'INVALID_VALIDATION_RULE_EXPRESSION',
}

const getValidationRuleExceptionUserFriendlyMessage = (
  code: ValidationRuleExceptionCode,
) => {
  switch (code) {
    case ValidationRuleExceptionCode.VALIDATION_RULE_NOT_FOUND:
      return msg`Validation rule not found.`;
    case ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT:
      return msg`Invalid validation rule input.`;
    case ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_EXPRESSION:
      return msg`Invalid validation rule expression.`;
    default:
      assertUnreachable(code);
  }
};

export class ValidationRuleException extends CustomException<ValidationRuleExceptionCode> {
  constructor(
    message: string,
    code: ValidationRuleExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getValidationRuleExceptionUserFriendlyMessage(code),
    });
  }
}
