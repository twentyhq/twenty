/* @license Enterprise */

import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export type RecordAccessGroupCondition = {
  compactId: number;
  condition: SqlCondition | null;
};
