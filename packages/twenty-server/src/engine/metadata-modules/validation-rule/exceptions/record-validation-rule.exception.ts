import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { type RecordValidationRuleViolation } from 'src/engine/metadata-modules/validation-rule/types/record-validation-rule-violation.type';
import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum RecordValidationRuleExceptionCode {
  VALIDATION_RULE_VIOLATION = 'VALIDATION_RULE_VIOLATION',
  VALIDATION_RULE_EVALUATION_FAILED = 'VALIDATION_RULE_EVALUATION_FAILED',
}

const getRecordValidationRuleUserFriendlyMessage = ({
  code,
  message,
}: {
  code: RecordValidationRuleExceptionCode;
  message: string;
}): MessageDescriptor => {
  switch (code) {
    case RecordValidationRuleExceptionCode.VALIDATION_RULE_VIOLATION: {
      return {
        id: 'validation-rule-violation',
        message: '{ruleMessage}',
        values: { ruleMessage: message },
      };
    }
    case RecordValidationRuleExceptionCode.VALIDATION_RULE_EVALUATION_FAILED:
      return msg`A validation rule could not be evaluated. Ask an admin to review it.`;
    default:
      return assertUnreachable(code);
  }
};
const RECORD_VALIDATION_RULE_EXCEPTION_CATEGORY_BY_CODE = {
  [RecordValidationRuleExceptionCode.VALIDATION_RULE_VIOLATION]:
    'INTERNAL_SERVER_ERROR',
  [RecordValidationRuleExceptionCode.VALIDATION_RULE_EVALUATION_FAILED]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  RecordValidationRuleExceptionCode,
  ExceptionCategory
>;

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
        message,
      }),
      category: RECORD_VALIDATION_RULE_EXCEPTION_CATEGORY_BY_CODE[code],
    });

    this.violations = violations;
  }
}
