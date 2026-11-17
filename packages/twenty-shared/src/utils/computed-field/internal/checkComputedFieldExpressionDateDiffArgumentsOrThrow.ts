import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { readComputedFieldExpressionDateUnitOrThrow } from '@/utils/computed-field/internal/readComputedFieldExpressionDateUnitOrThrow';
import { toComputedFieldExpressionDateOperandOrThrow } from '@/utils/computed-field/internal/toComputedFieldExpressionDateOperandOrThrow';

export const checkComputedFieldExpressionDateDiffArgumentsOrThrow: ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =
  ({ functionArguments, usage }) => {
    readComputedFieldExpressionDateUnitOrThrow({
      operand: functionArguments[2],
      usage,
    });

    return {
      functionArguments: functionArguments.map((operand, index) =>
        index < 2
          ? toComputedFieldExpressionDateOperandOrThrow({ operand, usage })
          : operand,
      ),
      type: FieldMetadataType.NUMBER,
    };
  };
