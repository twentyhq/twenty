import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ValidationRuleException,
  ValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';

export const validationRuleGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof ValidationRuleException) {
    switch (error.code) {
      case ValidationRuleExceptionCode.VALIDATION_RULE_NOT_FOUND:
        throw new NotFoundError(error);
      case ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT:
      case ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_EXPRESSION:
        throw new UserInputError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
