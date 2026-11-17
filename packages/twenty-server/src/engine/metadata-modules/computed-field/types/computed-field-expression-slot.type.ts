import { type ComputedFieldValueType } from 'twenty-shared/types';

// Without `valueTypes` the expression may return any type
export type ComputedFieldExpressionSlot = {
  property: string;
  evaluatedOn: 'RECORD' | 'RELATED_RECORD';
  isRequired: boolean;
  valueTypes?: ComputedFieldValueType[];
};
