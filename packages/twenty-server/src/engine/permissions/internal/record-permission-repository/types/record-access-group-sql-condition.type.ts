/* @license Enterprise */

import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export type RecordAccessGroupSQLCondition = {
  compactId: number;
  sqlCondition: SQLCondition | null;
};
