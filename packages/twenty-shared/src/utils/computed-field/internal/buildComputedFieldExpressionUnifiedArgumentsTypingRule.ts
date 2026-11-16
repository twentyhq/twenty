import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { unifyComputedFieldExpressionOperandsOrThrow } from '@/utils/computed-field/internal/unifyComputedFieldExpressionOperandsOrThrow';
import { isDefined } from '@/utils/validation/isDefined';

// The function returns the one type its arguments share
export const buildComputedFieldExpressionUnifiedArgumentsTypingRule =
  (
    allowedTypes?: ComputedFieldValueType[],
  ): ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =>
  ({ functionArguments, usage }) => {
    const { type, unify } = unifyComputedFieldExpressionOperandsOrThrow({
      operands: functionArguments,
      usage,
    });

    if (isDefined(allowedTypes)) {
      assertComputedFieldExpressionTypeOrThrow({ type, allowedTypes, usage });
    }

    return { functionArguments: functionArguments.map(unify), type };
  };
