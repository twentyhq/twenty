import { EXPRESSION_DATE_PARTS } from '@/constants/ExpressionDateParts';
import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { readComputedFieldExpressionDateLiteralOrThrow } from '@/utils/computed-field/internal/readComputedFieldExpressionDateLiteralOrThrow';
import { toComputedFieldExpressionDateOperandOrThrow } from '@/utils/computed-field/internal/toComputedFieldExpressionDateOperandOrThrow';
import { isExpressionDatePart } from '@/utils/expression-date/isExpressionDatePart';

export const checkComputedFieldExpressionDatePartArgumentsOrThrow: ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =
  ({ functionArguments, usage }) => {
    readComputedFieldExpressionDateLiteralOrThrow({
      operand: functionArguments[1],
      usage,
      kind: 'part',
      allowedValues: EXPRESSION_DATE_PARTS,
      isAllowedValue: isExpressionDatePart,
    });

    return {
      functionArguments: functionArguments.map((operand, index) =>
        index === 0
          ? toComputedFieldExpressionDateOperandOrThrow({ operand, usage })
          : operand,
      ),
      type: FieldMetadataType.NUMBER,
    };
  };
