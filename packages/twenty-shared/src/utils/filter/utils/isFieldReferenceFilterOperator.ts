import { FIELD_REFERENCE_FILTER_OPERATORS } from '@/constants';
import { type FieldReferenceFilterOperator } from '@/types';

export const isFieldReferenceFilterOperator = (
  operator: string,
): operator is FieldReferenceFilterOperator =>
  Object.keys(FIELD_REFERENCE_FILTER_OPERATORS).includes(operator);
