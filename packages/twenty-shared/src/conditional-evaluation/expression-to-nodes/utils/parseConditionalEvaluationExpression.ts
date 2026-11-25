// TODO(@neo773): remove once no rule is written as text anymore (stored widget rules are converted in 2.61; built-in rules and app manifests still send text)
import { isNonEmptyString } from '@sniptt/guards';
import { type Expression } from 'expr-eval-fork';

import { type ConditionalAvailabilityMetadataName } from '@/conditional-evaluation/common/types/ConditionalAvailabilityMetadataName';
import { CONDITIONAL_EVALUATION_EXPRESSION_MAX_LENGTH } from '@/conditional-evaluation/expression-to-nodes/constants/ConditionalEvaluationExpressionMaxLength';
import { type ConditionalEvaluationParseResult } from '@/conditional-evaluation/expression-to-nodes/types/ConditionalEvaluationParseResult';
import { conditionalEvaluationStrictParser } from '@/conditional-evaluation/expression-to-nodes/utils/conditionalEvaluationStrictParser';
import { toConditionalEvaluationNode } from '@/conditional-evaluation/expression-to-nodes/utils/toConditionalEvaluationNode';
import { validateConditionalEvaluationNode } from '@/conditional-evaluation/validate/utils/validateConditionalEvaluationNode';
import { getExpressionSyntaxError } from '@/utils/expression/getExpressionSyntaxError';

const safeParseExpression = ({
  expression,
}: {
  expression: string;
}): { parsedExpression: Expression } | { error: unknown } => {
  try {
    return {
      parsedExpression: conditionalEvaluationStrictParser.parse(expression),
    };
  } catch (error) {
    return { error };
  }
};

export const parseConditionalEvaluationExpression = ({
  expression,
  metadataName,
}: {
  expression: string | null | undefined;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalEvaluationParseResult => {
  if (!isNonEmptyString(expression) || expression.trim() === '') {
    return { isValid: true, node: null };
  }

  if (expression.length > CONDITIONAL_EVALUATION_EXPRESSION_MAX_LENGTH) {
    return {
      isValid: false,
      errorCode: 'EXPRESSION_TOO_LONG',
      errorMessage: `Expression is longer than ${CONDITIONAL_EVALUATION_EXPRESSION_MAX_LENGTH} characters`,
      errorParams: {
        maxLength: CONDITIONAL_EVALUATION_EXPRESSION_MAX_LENGTH,
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

  const nodeResult = toConditionalEvaluationNode({
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

  return validateConditionalEvaluationNode({
    node: nodeResult.node,
    metadataName,
  });
};
