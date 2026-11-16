import { COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES } from '@/constants/ComputedFieldExpressionOrderedValueTypes';
import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { type ComputedFieldExpressionFunctionName } from '@/types/ComputedFieldExpressionFunctionName';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { buildComputedFieldExpressionArgumentsOfTypeTypingRule } from '@/utils/computed-field/internal/buildComputedFieldExpressionArgumentsOfTypeTypingRule';
import { buildComputedFieldExpressionUnifiedArgumentsTypingRule } from '@/utils/computed-field/internal/buildComputedFieldExpressionUnifiedArgumentsTypingRule';
import { checkComputedFieldExpressionConditionArgumentsOrThrow } from '@/utils/computed-field/internal/checkComputedFieldExpressionConditionArgumentsOrThrow';
import { checkComputedFieldExpressionDayCountArgumentsOrThrow } from '@/utils/computed-field/internal/checkComputedFieldExpressionDayCountArgumentsOrThrow';

// One description per function: a later evaluator in JavaScript belongs next to the typing rule
export const COMPUTED_FIELD_EXPRESSION_FUNCTIONS: Record<
  ComputedFieldExpressionFunctionName,
  ComputedFieldExpressionFunction
> = {
  if: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    checkArgumentsOrThrow:
      checkComputedFieldExpressionConditionArgumentsOrThrow,
  },
  coalesce: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionUnifiedArgumentsTypingRule(),
  },
  isDefined: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        type: FieldMetadataType.BOOLEAN,
      }),
  },
  isEmpty: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        type: FieldMetadataType.BOOLEAN,
      }),
  },
  min: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionUnifiedArgumentsTypingRule(
        COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES,
      ),
  },
  max: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionUnifiedArgumentsTypingRule(
        COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES,
      ),
  },
  round: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 2,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        argumentType: FieldMetadataType.NUMBER,
        type: FieldMetadataType.NUMBER,
      }),
  },
  abs: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        argumentType: FieldMetadataType.NUMBER,
        type: FieldMetadataType.NUMBER,
      }),
  },
  ceil: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        argumentType: FieldMetadataType.NUMBER,
        type: FieldMetadataType.NUMBER,
      }),
  },
  floor: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        argumentType: FieldMetadataType.NUMBER,
        type: FieldMetadataType.NUMBER,
      }),
  },
  trunc: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        argumentType: FieldMetadataType.NUMBER,
        type: FieldMetadataType.NUMBER,
      }),
  },
  concat: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        type: FieldMetadataType.TEXT,
      }),
  },
  lower: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        argumentType: FieldMetadataType.TEXT,
        type: FieldMetadataType.TEXT,
      }),
  },
  upper: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        argumentType: FieldMetadataType.TEXT,
        type: FieldMetadataType.TEXT,
      }),
  },
  length: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow:
      buildComputedFieldExpressionArgumentsOfTypeTypingRule({
        argumentType: FieldMetadataType.TEXT,
        type: FieldMetadataType.NUMBER,
      }),
  },
  daysBetween: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    checkArgumentsOrThrow: checkComputedFieldExpressionDayCountArgumentsOrThrow,
  },
  daysSince: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    checkArgumentsOrThrow: checkComputedFieldExpressionDayCountArgumentsOrThrow,
  },
};
