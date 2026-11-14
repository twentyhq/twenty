/* @license Enterprise */

import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export type RecordAccessGroupSQLCondition =
  | { compactId: number; sqlCondition: SQLCondition | null }
  // several groups a record holds or not depending on one value, read in one expression that returns their compact ids
  | { compactIdsSQLExpression: SQLCondition };
