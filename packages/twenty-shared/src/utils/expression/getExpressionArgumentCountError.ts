import { VALIDATION_RULE_FUNCTIONS } from '@/constants/ValidationRuleFunctions';
import { type ExpressionInstruction } from '@/types/ExpressionInstruction';
import { type ValidationRuleErrorParams } from '@/types/ValidationRuleErrorParams';
import { isValidationRuleFunctionName } from '@/utils/validation-rule/isValidationRuleFunctionName';
import { isDefined } from '@/utils/validation/isDefined';

const OPERAND_COUNT_BY_OPERATOR_TYPE: Partial<Record<string, number>> = {
  IMEMBER: 1,
  IOP1: 1,
  IOP2: 2,
  IOP3: 3,
};

type ArgumentCountError = {
  errorMessage: string;
  errorParams: ValidationRuleErrorParams;
};

const getFunctionCallArgumentCountError = ({
  functionName,
  argumentCount,
}: {
  functionName: string | undefined;
  argumentCount: number;
}): ArgumentCountError | undefined => {
  if (!isDefined(functionName) || !isValidationRuleFunctionName(functionName)) {
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
  instructions: ExpressionInstruction[],
): ArgumentCountError | undefined => {
  const functionNameStack: (string | undefined)[] = [];
  const popOperands = (count: number) =>
    functionNameStack.splice(functionNameStack.length - count, count);

  for (const { type, value } of instructions) {
    if (type === 'IEXPR' && Array.isArray(value)) {
      const nestedError = getExpressionArgumentCountError(value);

      if (isDefined(nestedError)) {
        return nestedError;
      }
    }

    if (type === 'IVAR') {
      functionNameStack.push(String(value));
      continue;
    }

    if (type === 'IFUNCALL') {
      const argumentCount = Number(value);

      popOperands(argumentCount);

      const functionName = functionNameStack.pop();

      const callError = getFunctionCallArgumentCountError({
        functionName,
        argumentCount,
      });

      if (isDefined(callError)) {
        return callError;
      }
    } else {
      popOperands(
        type === 'IARRAY'
          ? Number(value)
          : (OPERAND_COUNT_BY_OPERATOR_TYPE[type] ?? 0),
      );
    }

    functionNameStack.push(undefined);
  }

  return undefined;
};
