import { type UniversalConditionalDisplay } from 'twenty-shared/types';

export type UniversalConditionalDisplayRecordFilter = NonNullable<
  UniversalConditionalDisplay['recordFilters']
>[number];
