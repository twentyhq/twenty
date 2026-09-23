import { type Instruction } from 'expr-eval-fork';

const BRACKET_ACCESS_OPERATOR = '[';

export const hasValidationRuleBracketAccess = (
  instructions: Instruction[],
): boolean =>
  instructions.some((instruction) => {
    if (instruction.type === 'IOP2') {
      return instruction.value === BRACKET_ACCESS_OPERATOR;
    }

    return (
      instruction.type === 'IEXPR' &&
      Array.isArray(instruction.value) &&
      hasValidationRuleBracketAccess(instruction.value as Instruction[])
    );
  });
