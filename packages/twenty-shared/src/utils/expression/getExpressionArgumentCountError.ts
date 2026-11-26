import { VALIDATION_RULE_FUNCTIONS } from '@/constants/ValidationRuleFunctions';
import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { type ValidationRuleErrorParams } from '@/types/ValidationRuleErrorParams';
import { getExpressionNodeChildren } from '@/expression/utils/internal/getExpressionNodeChildren';
import { isValidationRuleFunctionName } from '@/utils/validation-rule/isValidationRuleFunctionName';
import { isDefined } from '@/utils/validation/isDefined';

type ArgumentCountError = {
  errorMessage: string;
  errorParams: ValidationRuleErrorParams;
};

const getFunctionCallArgumentCountError = ({
  functionName,
  argumentCount,
}: {
  functionName: string;
  argumentCount: number;
}): ArgumentCountError | undefined => {
  if (!isValidationRuleFunctionName(functionName)) {
    return undefined;
  }

  const { minimumArgumentCount, maximumArgumentCount } =
    VALIDATION_RULE_FUNCTIONS[functionName];

  if (
    argumentCount >= minimumArgumentCount &&
    argumentCount <= maximumArgumentCount
  ) {
    return undefined;
  }

  const expectedArgumentCount =
    minimumArgumentCount === maximumArgumentCount
      ? `${minimumArgumentCount}`
      : `at least ${minimumArgumentCount}`;

  return {
    errorMessage: `${functionName} takes ${expectedArgumentCount} argument(s), but got ${argumentCount}`,
    errorParams: {
      functionName,
      minimumArgumentCount,
      maximumArgumentCount,
      argumentCount,
    },
  };
};

export const getExpressionArgumentCountError = (
  node: ExpressionNode,
): ArgumentCountError | undefined => {
  for (const child of getExpressionNodeChildren(node)) {
    const childError = getExpressionArgumentCountError(child);

    if (isDefined(childError)) {
      return childError;
    }
  }

  return node.type === 'FUNCTION_CALL'
    ? getFunctionCallArgumentCountError({
        functionName: node.functionName,
        argumentCount: node.arguments.length,
      })
    : undefined;
};
