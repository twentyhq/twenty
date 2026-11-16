import { type ObjectLiteral } from 'typeorm';

export type SQLCondition = { sql: string; parameters: ObjectLiteral };
