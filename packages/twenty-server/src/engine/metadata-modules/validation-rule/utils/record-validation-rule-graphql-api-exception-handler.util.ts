import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type RecordValidationRuleException } from 'src/engine/metadata-modules/validation-rule/exceptions/record-validation-rule.exception';

export const recordValidationRuleGraphqlApiExceptionHandler = (
  error: RecordValidationRuleException,
): never => {
  throw new BaseGraphQLError(error.message, ErrorCode.BAD_USER_INPUT, {
    subCode: error.code,
    userFriendlyMessage: error.userFriendlyMessage,
    validationRuleViolations: error.violations,
  });
};
