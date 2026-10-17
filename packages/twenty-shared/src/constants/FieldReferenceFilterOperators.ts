import { type FieldReferenceFilterOperator } from '@/types';

export const FIELD_REFERENCE_FILTER_OPERATORS: Record<
  FieldReferenceFilterOperator,
  {
    comparisonOperator: 'gt' | 'gte' | 'lt' | 'lte';
    isParentFieldReference: boolean;
  }
> = {
  gtField: { comparisonOperator: 'gt', isParentFieldReference: false },
  gteField: { comparisonOperator: 'gte', isParentFieldReference: false },
  ltField: { comparisonOperator: 'lt', isParentFieldReference: false },
  lteField: { comparisonOperator: 'lte', isParentFieldReference: false },
  gtParentField: { comparisonOperator: 'gt', isParentFieldReference: true },
  gteParentField: { comparisonOperator: 'gte', isParentFieldReference: true },
  ltParentField: { comparisonOperator: 'lt', isParentFieldReference: true },
  lteParentField: { comparisonOperator: 'lte', isParentFieldReference: true },
};
