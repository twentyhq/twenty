import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { readComputedFieldExpressionDateUnitOrThrow } from '@/utils/computed-field/internal/readComputedFieldExpressionDateUnitOrThrow';
import { toComputedFieldExpressionDateOperandOrThrow } from '@/utils/computed-field/internal/toComputedFieldExpressionDateOperandOrThrow';

export const checkComputedFieldExpressionDateTruncArgumentsOrThrow: ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =
  ({ functionArguments, usage }) => {
    readComputedFieldExpressionDateUnitOrThrow({
      operand: functionArguments[1],
      usage,
    });

    const checkedArguments = functionArguments.map((operand, index) =>
      index === 0
        ? toComputedFieldExpressionDateOperandOrThrow({ operand, usage })
        : operand,
    );

    return {
      functionArguments: checkedArguments,
      type:
        checkedArguments[0]?.type === FieldMetadataType.DATE
          ? FieldMetadataType.DATE
          : FieldMetadataType.DATE_TIME,
    };
  };
