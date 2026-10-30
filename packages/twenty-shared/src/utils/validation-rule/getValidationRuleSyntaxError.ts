import { type ValidationRuleErrorCode } from '@/types/ValidationRuleErrorCode';
import { type ValidationRuleErrorParams } from '@/types/ValidationRuleErrorParams';
import { tokenizeValidationRuleExpression } from '@/utils/validation-rule/tokenizeValidationRuleExpression';
import { isDefined } from '@/utils/validation/isDefined';

const UNKNOWN_CHARACTER_PATTERN = /Unknown character "(.+)"/;
const UNEXPECTED_TOKEN_PATTERN = /^unexpected T[A-Z]+: (.+)$/;
const MISSING_CLOSING_PARENTHESIS_MESSAGE = 'Expected )';
const END_OF_EXPRESSION_TOKEN_TYPE = 'TEOF';

type ValidationRuleSyntaxError = {
  errorMessage: string;
  errorCode: ValidationRuleErrorCode;
  errorParams?: ValidationRuleErrorParams;
};

export const getValidationRuleSyntaxError = ({
  expression,
  error,
}: {
  expression: string;
  error: unknown;
}): ValidationRuleSyntaxError => {
  const parserMessage = error instanceof Error ? error.message : String(error);

  const hasUnclosedText = tokenizeValidationRuleExpression(expression).some(
    (token) => token.type === 'unclosedString',
  );

  if (hasUnclosedText) {
    return {
      errorMessage: 'A text value is missing its closing quote',
      errorCode: 'UNCLOSED_TEXT',
    };
  }

  if (
    parserMessage.includes(END_OF_EXPRESSION_TOKEN_TYPE) ||
    parserMessage.endsWith(MISSING_CLOSING_PARENTHESIS_MESSAGE)
  ) {
    return {
      errorMessage: 'Expression is incomplete',
      errorCode: 'INCOMPLETE_EXPRESSION',
    };
  }

  const token =
    parserMessage.match(UNKNOWN_CHARACTER_PATTERN)?.[1] ??
    parserMessage.match(UNEXPECTED_TOKEN_PATTERN)?.[1];

  if (isDefined(token)) {
    return {
      errorMessage: `Unexpected "${token}"`,
      errorCode: 'INVALID_SYNTAX',
      errorParams: { token },
    };
  }

  return {
    errorMessage: 'Expression is not valid',
    errorCode: 'INVALID_SYNTAX',
  };
};
