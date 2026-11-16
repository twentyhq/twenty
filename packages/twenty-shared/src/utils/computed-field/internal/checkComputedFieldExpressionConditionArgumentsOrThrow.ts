import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { getComputedFieldExpressionUnifiedType } from '@/utils/computed-field/internal/getComputedFieldExpressionUnifiedType';
import { unifyComputedFieldExpressionOperandOrThrow } from '@/utils/computed-field/internal/unifyComputedFieldExpressionOperandOrThrow';

// The first argument is the condition; the others are its branches and share one type
export const checkComputedFieldExpressionConditionArgumentsOrThrow: ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =
  ({ functionArguments, usage }) => {
    const [condition, ...branches] = functionArguments;

    assertComputedFieldExpressionTypeOrThrow({
      type: condition?.type,
      allowedTypes: [FieldMetadataType.BOOLEAN],
      usage: `The condition of ${usage}`,
    });

    const type = getComputedFieldExpressionUnifiedType(branches);

    return {
      functionArguments: functionArguments.map((operand) =>
        operand === condition
          ? operand
          : unifyComputedFieldExpressionOperandOrThrow({
              operand,
              type,
              usage,
            }),
      ),
      type,
    };
  };
