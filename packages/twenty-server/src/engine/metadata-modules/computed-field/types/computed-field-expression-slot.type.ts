import { type ComputedFieldValueType } from 'twenty-shared/types';

// With `listItemProperty`, `property` is a list whose items each hold one expression; without `valueTypes` any type
export type ComputedFieldExpressionSlot = {
  property: string;
  listItemProperty?: string;
  evaluatedOn: 'RECORD' | 'RELATED_RECORD';
  isRequired: boolean;
  valueTypes?: ComputedFieldValueType[];
};
