import { type ComputedFieldValueType } from 'twenty-shared/types';

// `property`: where the expression lives in the computation. With `listItemProperty`, the property is a list
// and each of its items holds one expression there. `valueTypes`: what it may return, anything when absent
export type ComputedFieldExpressionSlot = {
  property: string;
  listItemProperty?: string;
  evaluatedOn: 'RECORD' | 'RELATED_RECORD';
  isRequired: boolean;
  valueTypes?: ComputedFieldValueType[];
};
