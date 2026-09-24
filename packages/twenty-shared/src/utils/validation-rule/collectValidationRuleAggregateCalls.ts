import { type Instruction } from 'expr-eval-fork';

import { type ValidationRuleAggregateFunctionName } from '@/types/ValidationRuleAggregateFunctionName';
import { isValidationRuleAggregateFunctionName } from '@/utils/validation-rule/isValidationRuleAggregateFunctionName';

export type ValidationRuleAggregateCall = {
  functionName: ValidationRuleAggregateFunctionName;
  argumentPaths: (string | null)[];
};

type ValidationRuleAggregateCallCollection = {
  aggregateCalls: ValidationRuleAggregateCall[];
  pathsOutsideAggregateCalls: string[];
};

type StackEntry = { path: string | null };

const OPERAND_COUNT_BY_OPERATOR_INSTRUCTION_TYPE: Record<string, number> = {
  IOP1: 1,
  IOP2: 2,
  IOP3: 3,
  IENDSTATEMENT: 1,
};

export const collectValidationRuleAggregateCalls = (
  instructions: Instruction[],
): ValidationRuleAggregateCallCollection => {
  const aggregateCalls: ValidationRuleAggregateCall[] = [];
  const pathsOutsideAggregateCalls: string[] = [];
  const stack: StackEntry[] = [];

  const popEntries = (count: number): StackEntry[] =>
    count > 0 ? stack.splice(Math.max(stack.length - count, 0), count) : [];

  const releaseOutsideAggregateCalls = (entries: StackEntry[]) => {
    for (const entry of entries) {
      if (entry.path !== null) {
        pathsOutsideAggregateCalls.push(entry.path);
      }
    }
  };

  for (const instruction of instructions) {
    if (instruction.type === 'IVAR' || instruction.type === 'IVARNAME') {
      stack.push({ path: String(instruction.value) });
      continue;
    }

    if (instruction.type === 'IMEMBER') {
      const [objectEntry] = popEntries(1);

      stack.push({
        path:
          objectEntry?.path !== null && objectEntry?.path !== undefined
            ? `${objectEntry.path}.${String(instruction.value)}`
            : null,
      });
      continue;
    }

    if (instruction.type === 'IFUNCALL') {
      const argumentEntries = popEntries(Number(instruction.value));
      const [functionEntry] = popEntries(1);
      const functionName = functionEntry?.path ?? null;

      if (
        functionName !== null &&
        isValidationRuleAggregateFunctionName(functionName)
      ) {
        aggregateCalls.push({
          functionName,
          argumentPaths: argumentEntries.map((entry) => entry.path),
        });
      } else {
        releaseOutsideAggregateCalls(argumentEntries);
      }

      stack.push({ path: null });
      continue;
    }

    if (instruction.type === 'IEXPR' && Array.isArray(instruction.value)) {
      const nestedCollection = collectValidationRuleAggregateCalls(
        instruction.value as Instruction[],
      );

      aggregateCalls.push(...nestedCollection.aggregateCalls);
      pathsOutsideAggregateCalls.push(
        ...nestedCollection.pathsOutsideAggregateCalls,
      );
      stack.push({ path: null });
      continue;
    }

    const operandCount =
      instruction.type === 'IARRAY'
        ? Number(instruction.value)
        : OPERAND_COUNT_BY_OPERATOR_INSTRUCTION_TYPE[instruction.type];

    if (operandCount !== undefined) {
      releaseOutsideAggregateCalls(popEntries(operandCount));
    }

    if (instruction.type !== 'IENDSTATEMENT') {
      stack.push({ path: null });
    }
  }

  releaseOutsideAggregateCalls(stack);

  return { aggregateCalls, pathsOutsideAggregateCalls };
};
