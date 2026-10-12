import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type RecordValidationRuleException,
  RecordValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/exceptions/record-validation-rule.exception';

export const recordValidationRuleGraphqlApiExceptionHandler = (
  error: RecordValidationRuleException,
): never => {
  const errorCode =
    error.code ===
    RecordValidationRuleExceptionCode.VALIDATION_RULE_EVALUATION_FAILED
      ? ErrorCode.INTERNAL_SERVER_ERROR
      : ErrorCode.BAD_USER_INPUT;

  throw new BaseGraphQLError(error.message, errorCode, {
    subCode: error.code,
    userFriendlyMessage: error.userFriendlyMessage,
    validationRuleViolations: error.violations,
  });
};
