import { type ObjectLiteral } from 'typeorm';

export type SqlCondition = { sql: string; parameters: ObjectLiteral };

export type RowAccessPolicy =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'gated'; condition: SqlCondition };
