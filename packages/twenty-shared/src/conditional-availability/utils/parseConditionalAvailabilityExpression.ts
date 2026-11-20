import { isNonEmptyString } from '@sniptt/guards';
import { type Expression } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_EXPRESSION_MAX_LENGTH } from '@/conditional-availability/constants/ConditionalAvailabilityExpressionMaxLength';
import { type ConditionalAvailabilityMetadataName } from '@/conditional-availability/types/ConditionalAvailabilityMetadataName';
import { type ConditionalAvailabilityParseResult } from '@/conditional-availability/types/ConditionalAvailabilityParseResult';
import { checkConditionalAvailabilityNode } from '@/conditional-availability/utils/checkConditionalAvailabilityNode';
import { conditionalAvailabilityStrictParser } from '@/conditional-availability/utils/conditionalAvailabilityStrictParser';
import { toConditionalAvailabilityNode } from '@/conditional-availability/utils/toConditionalAvailabilityNode';
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
