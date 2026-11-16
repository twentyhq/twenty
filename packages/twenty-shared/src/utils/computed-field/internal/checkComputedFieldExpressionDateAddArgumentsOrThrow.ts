import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { readComputedFieldExpressionDateUnitOrThrow } from '@/utils/computed-field/internal/readComputedFieldExpressionDateUnitOrThrow';
import { toComputedFieldExpressionDateOperandOrThrow } from '@/utils/computed-field/internal/toComputedFieldExpressionDateOperandOrThrow';

// A date stays a date unless minutes or hours are added
export const checkComputedFieldExpressionDateAddArgumentsOrThrow: ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =
  ({ functionArguments, usage }) => {
    const unit = readComputedFieldExpressionDateUnitOrThrow({
      operand: functionArguments[2],
      usage,
    });

    assertComputedFieldExpressionTypeOrThrow({
      type: functionArguments[1]?.type,
      allowedTypes: [FieldMetadataType.NUMBER],
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
        checkedArguments[0]?.type === FieldMetadataType.DATE &&
        unit !== 'MINUTE' &&
        unit !== 'HOUR'
          ? FieldMetadataType.DATE
          : FieldMetadataType.DATE_TIME,
    };
  };
