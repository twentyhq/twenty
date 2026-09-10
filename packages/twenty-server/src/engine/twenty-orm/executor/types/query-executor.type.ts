import { type CompiledStatement } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

export type QueryExecutor = {
  execute: (statement: CompiledStatement) => Promise<Record<string, unknown>[]>;
};
