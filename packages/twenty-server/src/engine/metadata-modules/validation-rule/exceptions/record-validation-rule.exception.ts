import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { type RecordValidationRuleViolation } from 'src/engine/metadata-modules/validation-rule/types/record-validation-rule-violation.type';
import { CustomException } from 'src/utils/custom-exception';

export enum RecordValidationRuleExceptionCode {
  VALIDATION_RULE_VIOLATION = 'VALIDATION_RULE_VIOLATION',
  VALIDATION_RULE_EVALUATION_FAILED = 'VALIDATION_RULE_EVALUATION_FAILED',
}

const getRecordValidationRuleUserFriendlyMessage = ({
  code,
  violations,
}: {
  code: RecordValidationRuleExceptionCode;
  violations: RecordValidationRuleViolation[];
}): MessageDescriptor => {
  switch (code) {
    case RecordValidationRuleExceptionCode.VALIDATION_RULE_VIOLATION: {
      const ruleMessage = violations[0]?.message ?? '';

      return { id: ruleMessage, message: ruleMessage };
    }
    case RecordValidationRuleExceptionCode.VALIDATION_RULE_EVALUATION_FAILED:
      return msg`A validation rule could not be evaluated. Ask an admin to review it.`;
    default:
      return assertUnreachable(code);
  }
};

export class RecordValidationRuleException extends CustomException<RecordValidationRuleExceptionCode> {
  readonly violations: RecordValidationRuleViolation[];

  constructor(
    message: string,
    code: RecordValidationRuleExceptionCode,
    violations: RecordValidationRuleViolation[],
  ) {
    super(message, code, {
      userFriendlyMessage: getRecordValidationRuleUserFriendlyMessage({
        code,
        violations,
      }),
    });

    this.violations = violations;
  }
}
