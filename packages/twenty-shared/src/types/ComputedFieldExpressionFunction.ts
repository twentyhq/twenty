import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';

// The typing rule receives the argument nodes, so it can depend on a literal value and retype a literal
export type ComputedFieldExpressionFunction = {
  minimumArgumentCount: number;
  maximumArgumentCount: number;
  checkArgumentsOrThrow: (args: {
    functionArguments: TypedComputedFieldExpressionNode[];
    usage: string;
  }) => {
    functionArguments: TypedComputedFieldExpressionNode[];
    type: ComputedFieldValueType | undefined;
  };
};
