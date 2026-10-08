import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// A filter no record satisfies: both the SQL renderer and the in-memory
// matcher read an empty conjunction as true, so its negation is always false.
export const UNSATISFIABLE_RECORD_FILTER: RecordGqlOperationFilter = {
  not: { and: [] },
};
