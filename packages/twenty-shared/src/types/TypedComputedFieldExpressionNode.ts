import { type ComputedFieldExpressionFunctionName } from '@/types/ComputedFieldExpressionFunctionName';
import { type ComputedFieldExpressionNode } from '@/types/ComputedFieldExpressionNode';
import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';

// `type` is undefined when it cannot be known, as for a value the reader is not allowed to see
export type TypedComputedFieldExpressionNode = ComputedFieldExpressionNode<
  { type: ComputedFieldValueType | undefined },
  ComputedFieldExpressionFunctionName
>;
