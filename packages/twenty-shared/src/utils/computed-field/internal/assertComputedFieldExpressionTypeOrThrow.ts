import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { isDefined } from '@/utils/validation/isDefined';

export const assertComputedFieldExpressionTypeOrThrow = ({
  type,
  allowedTypes,
  usage,
}: {
  type: ComputedFieldValueType | undefined;
  allowedTypes: ComputedFieldValueType[];
  usage: string;
}): void => {
  if (isDefined(type) && !allowedTypes.includes(type)) {
    throw new ComputedFieldExpressionError(
      `${usage} expects ${allowedTypes.join(' or ').toLowerCase()}, not ${type.toLowerCase()}`,
    );
  }
};
