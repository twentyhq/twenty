import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { readComputedFieldExpressionDateUnitOrThrow } from '@/utils/computed-field/internal/readComputedFieldExpressionDateUnitOrThrow';
import { toComputedFieldExpressionDateOperandOrThrow } from '@/utils/computed-field/internal/toComputedFieldExpressionDateOperandOrThrow';

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

    const isAddingTimeOfDay = unit === 'MINUTE' || unit === 'HOUR';
    const isDate =
      checkedArguments[0]?.type === FieldMetadataType.DATE &&
      !isAddingTimeOfDay;

    return {
      functionArguments: checkedArguments,
      type: isDate ? FieldMetadataType.DATE : FieldMetadataType.DATE_TIME,
    };
  };
