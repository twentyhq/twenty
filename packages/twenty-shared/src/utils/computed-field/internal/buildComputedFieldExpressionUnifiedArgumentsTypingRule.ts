import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { getComputedFieldExpressionUnifiedType } from '@/utils/computed-field/internal/getComputedFieldExpressionUnifiedType';
import { unifyComputedFieldExpressionOperandOrThrow } from '@/utils/computed-field/internal/unifyComputedFieldExpressionOperandOrThrow';
import { isDefined } from '@/utils/validation/isDefined';

// The function returns the one type its arguments share
export const buildComputedFieldExpressionUnifiedArgumentsTypingRule =
  (
    allowedTypes?: ComputedFieldValueType[],
  ): ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =>
  ({ functionArguments, usage }) => {
    const type = getComputedFieldExpressionUnifiedType(functionArguments);

    if (isDefined(allowedTypes)) {
      assertComputedFieldExpressionTypeOrThrow({ type, allowedTypes, usage });
    }

    return {
      functionArguments: functionArguments.map((operand) =>
        unifyComputedFieldExpressionOperandOrThrow({ operand, type, usage }),
      ),
      type,
    };
  };
