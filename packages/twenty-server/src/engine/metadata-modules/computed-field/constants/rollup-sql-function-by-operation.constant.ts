import { type FieldMetadataRollupOperation } from 'twenty-shared/types';

// The stored operation is never written into SQL itself
export const ROLLUP_SQL_FUNCTION_BY_OPERATION = {
  COUNT: 'COUNT',
  SUM: 'SUM',
  AVG: 'AVG',
  MIN: 'MIN',
  MAX: 'MAX',
} as const satisfies Record<FieldMetadataRollupOperation, string>;
