import { type ComputedFieldExpressionFunction } from '@/types/ComputedFieldExpressionFunction';
import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { isDefined } from '@/utils/validation/isDefined';

// Without an argument type, arguments of any type are taken
export const buildComputedFieldExpressionArgumentsOfTypeTypingRule =
  ({
    argumentType,
    type,
  }: {
    argumentType?: ComputedFieldValueType;
    type: ComputedFieldValueType;
  }): ComputedFieldExpressionFunction['checkArgumentsOrThrow'] =>
  ({ functionArguments, usage }) => {
    if (isDefined(argumentType)) {
      for (const functionArgument of functionArguments) {
        assertComputedFieldExpressionTypeOrThrow({
          type: functionArgument.type,
          allowedTypes: [argumentType],
          usage,
        });
      }
    }

    return { functionArguments, type };
  };
