// TODO(@neo773): remove once no rule is written as text anymore (stored widget rules are converted in 2.61; built-in rules and app manifests still send text)
import { isNonEmptyString } from '@sniptt/guards';
import { type Expression } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_EXPRESSION_MAX_LENGTH } from '@/conditional-availability/constants/ConditionalAvailabilityExpressionMaxLength';
import { type ConditionalAvailabilityMetadataName } from '@/conditional-availability/types/ConditionalAvailabilityMetadataName';
import { type ConditionalAvailabilityParseResult } from '@/conditional-availability/types/ConditionalAvailabilityParseResult';
import { conditionalAvailabilityStrictParser } from '@/conditional-availability/utils/conditionalAvailabilityStrictParser';
import { toConditionalAvailabilityNode } from '@/conditional-availability/utils/toConditionalAvailabilityNode';
import { validateConditionalAvailabilityNode } from '@/conditional-availability/utils/validateConditionalAvailabilityNode';
import { getExpressionSyntaxError } from '@/utils/expression/getExpressionSyntaxError';

const safeParseExpression = ({
  expression,
}: {
  expression: string;
}): { parsedExpression: Expression } | { error: unknown } => {
  try {
    return {
      parsedExpression: conditionalAvailabilityStrictParser.parse(expression),
    };
  } catch (error) {
    return { error };
  }
};

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

  const parseResult = safeParseExpression({ expression });

  if ('error' in parseResult) {
    return {
      isValid: false,
      ...getExpressionSyntaxError({ expression, error: parseResult.error }),
    };
  }

  const nodeResult = toConditionalAvailabilityNode({
    instructions: parseResult.parsedExpression.tokens,
  });

  if ('unexpectedToken' in nodeResult) {
    return {
      isValid: false,
      errorCode: 'INVALID_SYNTAX',
      errorMessage: `Unexpected "${nodeResult.unexpectedToken}"`,
      errorParams: { token: nodeResult.unexpectedToken },
    };
  }

  return validateConditionalAvailabilityNode({
    node: nodeResult.node,
    metadataName,
  });
};
