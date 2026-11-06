import { type ObjectLiteral } from 'typeorm';

export type SqlCondition = { sql: string; parameters: ObjectLiteral };
