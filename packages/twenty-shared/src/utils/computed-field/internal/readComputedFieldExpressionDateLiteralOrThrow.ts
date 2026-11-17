import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { getExpressionDateLiteralErrorMessage } from '@/utils/expression-date/getExpressionDateLiteralErrorMessage';

// A unit or part changes the SQL, so it must be written as text and is checked when the expression is saved
export const readComputedFieldExpressionDateLiteralOrThrow = <
  TLiteral extends string,
>({
  operand,
  usage,
  kind,
  allowedValues,
  isAllowedValue,
}: {
  operand: TypedComputedFieldExpressionNode | undefined;
  usage: string;
  kind: 'unit' | 'part';
  allowedValues: readonly TLiteral[];
  isAllowedValue: (value: unknown) => value is TLiteral;
}): TLiteral => {
  if (operand?.kind !== 'textLiteral') {
    throw new ComputedFieldExpressionError(
      `${usage} needs its ${kind} written as text, such as '${allowedValues[0]}'`,
    );
  }

  if (!isAllowedValue(operand.value)) {
    throw new ComputedFieldExpressionError(
      getExpressionDateLiteralErrorMessage({
        value: operand.value,
        kind,
        allowedValues,
      }),
    );
  }

  return operand.value;
};
