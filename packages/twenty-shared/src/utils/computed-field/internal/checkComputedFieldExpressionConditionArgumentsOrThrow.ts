import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { unifyComputedFieldExpressionOperandsOrThrow } from '@/utils/computed-field/internal/unifyComputedFieldExpressionOperandsOrThrow';

// The first argument is the condition; the others are its branches and share one type
export const checkComputedFieldExpressionConditionArgumentsOrThrow: ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =
  ({ functionArguments, usage }) => {
    const [condition, ...branches] = functionArguments;

    assertComputedFieldExpressionTypeOrThrow({
      type: condition?.type,
      allowedTypes: [FieldMetadataType.BOOLEAN],
      usage: `The condition of ${usage}`,
    });

    const { type, unify } = unifyComputedFieldExpressionOperandsOrThrow({
      operands: branches,
      usage,
    });

    return {
      functionArguments: functionArguments.map((operand) =>
        operand === condition ? operand : unify(operand),
      ),
      type,
    };
  };
