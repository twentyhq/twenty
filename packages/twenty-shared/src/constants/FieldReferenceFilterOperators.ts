import { type FieldReferenceFilterOperator } from '@/types';

export const FIELD_REFERENCE_FILTER_OPERATORS: Record<
  FieldReferenceFilterOperator,
  'gt' | 'gte' | 'lt' | 'lte'
> = {
  gtField: 'gt',
  gteField: 'gte',
  ltField: 'lt',
  lteField: 'lte',
};
