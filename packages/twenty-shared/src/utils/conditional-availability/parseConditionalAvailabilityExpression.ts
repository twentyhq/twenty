import { isNonEmptyString } from '@sniptt/guards';
import { type Expression } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_EXPRESSION_MAX_LENGTH } from '@/constants/ConditionalAvailabilityExpressionMaxLength';
import { type ConditionalAvailabilityMetadataName } from '@/types/ConditionalAvailabilityMetadataName';
import { type ConditionalAvailabilityParseResult } from '@/types/ConditionalAvailabilityParseResult';
import { checkConditionalAvailabilityNode } from '@/utils/conditional-availability/checkConditionalAvailabilityNode';
import { conditionalAvailabilityStrictParser } from '@/utils/conditional-availability/conditionalAvailabilityStrictParser';
import { toConditionalAvailabilityNode } from '@/utils/conditional-availability/toConditionalAvailabilityNode';
import { getExpressionSyntaxError } from '@/utils/expression/getExpressionSyntaxError';

export const parseConditionalAvailabilityExpression = ({
  expression,
  metadataName,
}: {
  expression: string | null | undefined;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityParseResult => {
  if (!isNonEmptyString(expression) || expression.trim() === '') {
    return { isValid: true, node: null };
  }

  if (expression.length > CONDITIONAL_AVAILABILITY_EXPRESSION_MAX_LENGTH) {
    return {
      isValid: false,
      errorCode: 'EXPRESSION_TOO_LONG',
      errorMessage: `Expression is longer than ${CONDITIONAL_AVAILABILITY_EXPRESSION_MAX_LENGTH} characters`,
      errorParams: {
        maxLength: CONDITIONAL_AVAILABILITY_EXPRESSION_MAX_LENGTH,
      },
    };
  }

  let parsedExpression: Expression;

  try {
    parsedExpression = conditionalAvailabilityStrictParser.parse(expression);
  } catch (error) {
    return {
      isValid: false,
      ...getExpressionSyntaxError({ expression, error }),
    };
  }

  const nodeResult = toConditionalAvailabilityNode({
    instructions: parsedExpression.tokens,
  });

  if ('unexpectedToken' in nodeResult) {
    return {
      isValid: false,
      errorCode: 'INVALID_SYNTAX',
      errorMessage: `Unexpected "${nodeResult.unexpectedToken}"`,
      errorParams: { token: nodeResult.unexpectedToken },
    };
  }

  return checkConditionalAvailabilityNode({
    node: nodeResult.node,
    metadataName,
  });
};
