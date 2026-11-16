import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { unifyComputedFieldExpressionOperandOrThrow } from '@/utils/computed-field/internal/unifyComputedFieldExpressionOperandOrThrow';

export const checkComputedFieldExpressionDayCountArgumentsOrThrow: ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =
  ({ functionArguments, usage }) => ({
    functionArguments: functionArguments.map((operand) =>
      unifyComputedFieldExpressionOperandOrThrow({
        operand,
        type: FieldMetadataType.DATE,
        usage,
      }),
    ),
    type: FieldMetadataType.NUMBER,
  });
