import { type ComputedFieldValueType } from 'twenty-shared/types';

// `property`: where the expression lives in the computation. `valueTypes`: what it may return, anything when absent
export type ComputedFieldExpressionSlot = {
  property: string;
  evaluatedOn: 'RECORD' | 'RELATED_RECORD';
  isRequired: boolean;
  valueTypes?: ComputedFieldValueType[];
};
