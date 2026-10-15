import { type Instruction } from 'expr-eval-fork';
import { isNumber, isString } from '@sniptt/guards';

import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { type ValidationRuleFunctionName } from '@/types/ValidationRuleFunctionName';
import { isDefined } from '@/utils/validation/isDefined';

type OperandItem =
  | { kind: 'field'; path: string; field: ValidationRuleFieldDescriptor }
  | { kind: 'text'; value: string }
  | { kind: 'list'; values: string[] }
  | { kind: 'function'; name: string }
  | { kind: 'other' };

type UnknownOptionValue = { fieldName: string; optionValue: string };

const OPTION_COMPARISON_OPERATORS = ['==', '!=', '<', '<=', '>', '>=', 'in'];

const INCLUDES_FUNCTION_NAME: ValidationRuleFunctionName = 'includes';

const OTHER_OPERAND: OperandItem = { kind: 'other' };

const findUnknownOptionValueInComparison = (
  fieldOperand: OperandItem | undefined,
  valueOperand: OperandItem | undefined,
): UnknownOptionValue | undefined => {
  if (
    fieldOperand?.kind !== 'field' ||
    !isDefined(fieldOperand.field.optionValues)
  ) {
    return undefined;
  }

  const comparedValues =
    valueOperand?.kind === 'text'
      ? [valueOperand.value]
      : valueOperand?.kind === 'list'
        ? valueOperand.values
        : [];

  const optionValues = fieldOperand.field.optionValues;
  const optionValue = comparedValues.find(
    (comparedValue) => !optionValues.includes(comparedValue),
  );

  return isDefined(optionValue)
    ? { fieldName: fieldOperand.path, optionValue }
    : undefined;
};

const resolveVariableOperand = (
  name: string,
  fields: ValidationRuleFieldDescriptor[],
): OperandItem => {
  const field = fields.find((candidate) => candidate.name === name);

  if (isDefined(field)) {
    return { kind: 'field', path: name, field };
  }

  return { kind: 'function', name };
};

const resolveMemberOperand = (
  parentOperand: OperandItem,
  memberName: string,
): OperandItem => {
  if (parentOperand.kind !== 'field') {
    return OTHER_OPERAND;
  }

  const targetField = parentOperand.field.relationTargetFields?.find(
    (candidate) => candidate.name === memberName,
  );

  return isDefined(targetField)
    ? {
        kind: 'field',
        path: `${parentOperand.path}.${memberName}`,
        field: targetField,
      }
    : OTHER_OPERAND;
};

export const findValidationRuleUnknownOptionValue = ({
  instructions,
  fields,
}: {
  instructions: Instruction[];
  fields: ValidationRuleFieldDescriptor[];
}): UnknownOptionValue | undefined => {
  const operandStack: OperandItem[] = [];

  const popOperand = (): OperandItem => operandStack.pop() ?? OTHER_OPERAND;

  const popOperands = (count: number): OperandItem[] =>
    Array.from({ length: count }, popOperand).reverse();

  for (const instruction of instructions) {
    switch (instruction.type) {
      case 'IVAR': {
        operandStack.push(
          isString(instruction.value)
            ? resolveVariableOperand(instruction.value, fields)
            : OTHER_OPERAND,
        );
        break;
      }
      case 'IMEMBER': {
        const parentOperand = popOperand();

        operandStack.push(
          isString(instruction.value)
            ? resolveMemberOperand(parentOperand, instruction.value)
            : OTHER_OPERAND,
        );
        break;
      }
      case 'INUMBER': {
        operandStack.push(
          isString(instruction.value)
            ? { kind: 'text', value: instruction.value }
            : OTHER_OPERAND,
        );
        break;
      }
      case 'IARRAY': {
        const elements = popOperands(
          isNumber(instruction.value) ? instruction.value : 0,
        );
        const isEveryElementText = elements.every(
          (element) => element.kind === 'text',
        );

        operandStack.push(
          isEveryElementText
            ? {
                kind: 'list',
                values: elements.flatMap((element) =>
                  element.kind === 'text' ? [element.value] : [],
                ),
              }
            : OTHER_OPERAND,
        );
        break;
      }
      case 'IOP2': {
        const [leftOperand, rightOperand] = popOperands(2);

        if (
          isString(instruction.value) &&
          OPTION_COMPARISON_OPERATORS.includes(instruction.value)
        ) {
          const unknownOptionValue =
            findUnknownOptionValueInComparison(leftOperand, rightOperand) ??
            findUnknownOptionValueInComparison(rightOperand, leftOperand);

          if (isDefined(unknownOptionValue)) {
            return unknownOptionValue;
          }
        }

        operandStack.push(OTHER_OPERAND);
        break;
      }
      case 'IFUNCALL': {
        const functionArguments = popOperands(
          isNumber(instruction.value) ? instruction.value : 0,
        );
        const functionOperand = popOperand();

        if (
          functionOperand.kind === 'function' &&
          functionOperand.name === INCLUDES_FUNCTION_NAME &&
          functionArguments.length === 2
        ) {
          const unknownOptionValue = findUnknownOptionValueInComparison(
            functionArguments[0],
            functionArguments[1],
          );

          if (isDefined(unknownOptionValue)) {
            return unknownOptionValue;
          }
        }

        operandStack.push(OTHER_OPERAND);
        break;
      }
      case 'IEXPR': {
        const unknownOptionValue = Array.isArray(instruction.value)
          ? findValidationRuleUnknownOptionValue({
              instructions: instruction.value as Instruction[],
              fields,
            })
          : undefined;

        if (isDefined(unknownOptionValue)) {
          return unknownOptionValue;
        }

        operandStack.push(OTHER_OPERAND);
        break;
      }
      case 'IOP1': {
        popOperand();
        operandStack.push(OTHER_OPERAND);
        break;
      }
      case 'IOP3': {
        popOperands(3);
        operandStack.push(OTHER_OPERAND);
        break;
      }
      default: {
        operandStack.push(OTHER_OPERAND);
      }
    }
  }

  return undefined;
};
