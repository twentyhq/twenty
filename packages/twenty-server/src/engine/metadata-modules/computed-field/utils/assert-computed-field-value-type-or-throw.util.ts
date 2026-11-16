import { type ComputedFieldValueType } from 'twenty-shared/types';
import { ComputedFieldExpressionError, isDefined } from 'twenty-shared/utils';

export const assertComputedFieldValueTypeOrThrow = ({
  valueType,
  expectedTypes,
  subject,
}: {
  valueType: ComputedFieldValueType | undefined;
  expectedTypes: ComputedFieldValueType[];
  subject: string;
}): void => {
  if (isDefined(valueType) && !expectedTypes.includes(valueType)) {
    throw new ComputedFieldExpressionError(
      `${subject} is ${valueType.toLowerCase()}, expected ${expectedTypes.join(' or ').toLowerCase()}`,
    );
  }
};
